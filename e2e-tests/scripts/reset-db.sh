#!/bin/bash

if [ $# -ne 1 ]; then
  echo "usage: $0 <deploy env>"
  exit 1
fi

DEPLOY_ENV="$1"

if [[ ! "$DEPLOY_ENV" =~ ^dev([0-9]{1}$|[0-9]{2}$)|^staging($|[1-6]{1}$)|test1|integration ]]; then
  echo "invalid deploy env $DEPLOY_ENV "
  exit 1
else
  echo "Env matched: $DEPLOY_ENV"
fi

set -e

TEMP_FILE="temp.sql"
TEMP_FILE_VIEWS='temp.views.sql'
rm -rf $TEMP_FILE
rm -rf $TEMP_FILE_VIEWS

echo 'Getting db credentials'


function ssm() {
  
  aws ssm get-parameter \
    --region eu-central-1 \
    --name $1 \
    --with-decryption \
    --query Parameter.Value \
    --output text
}

function apvar(){
  node -e "require('serverless-atheneum-var/lib/api').getResolvedVar('$1','$DEPLOY_ENV','$2').then(e=>console.log(e.data.value))"
}


SSM_LP="/${DEPLOY_ENV}/rds/legacy-platform"
SSM_TRAIN="/training/rds/legacy-platform"

# setup admin db vars
ADMIN_USERNAME=ap_admin
ADMIN_PASSWORD=$(ssm "/test1.atheneum-dev.com/ap-test1-legacy-mysql/ap_admin-password")

# setup src db vars
DB_HOST=127.0.0.1
SRC_DB=$(ssm "$SSM_TRAIN/dbname")
SRC_USERNAME=$(ssm "$SSM_TRAIN/username")
SRC_PASSWORD=$(ssm "$SSM_TRAIN/password")

# setup destination db vars
DEST_DB=$(ssm "$SSM_LP/dbname")
DEST_USERNAME=$(ssm "$SSM_LP/username")
DEST_PASSWORD=$(ssm "$SSM_LP/password")

# npm migrate vars
LEGACY_MYSQL_LEGACYPLATFORM_USERNAME="$DEST_USERNAME"
LEGACY_MYSQL_LEGACYPLATFORM_PASSWORD="$DEST_PASSWORD"
LEGACY_MYSQL_LEGACYPLATFORM_DATABASE="$DEST_DB"
LEGACY_MYSQL_LEGACYPLATFORM_HOST="$DB_HOST"
LEGACY_MYSQL_LEGACYPLATFORM_PORT=3306



# # drop views
echo 'Dropping existing tables and views'
mysql -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $DEST_DB <<-EOF

SET SESSION group_concat_max_len = 5500000;
SET FOREIGN_KEY_CHECKS = 0;

SET @DROP_STATEMENTS = NULL;

SELECT 
  IFNULL( 
    CONCAT('DROP VIEW ', GROUP_CONCAT(TABLE_SCHEMA,'.',TABLE_NAME SEPARATOR ',')),
    'SELECT "No Views to drop"'
  ) INTO @DROP_STATEMENTS
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA='$DEST_DB';

SELECT 'DROPPING VIEWS';
SELECT @DROP_STATEMENTS;  
PREPARE stmt FROM @DROP_STATEMENTS;
EXECUTE stmt;

SELECT 
  IFNULL( 
    CONCAT('DROP TABLE ', GROUP_CONCAT(TABLE_SCHEMA,'.',TABLE_NAME SEPARATOR ',')),
    'SELECT "No Tables to drop"'
  ) INTO @DROP_STATEMENTS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA='$DEST_DB';

SELECT 'DROPPING TABLES';
SELECT @DROP_STATEMENTS;  
PREPARE stmt FROM @DROP_STATEMENTS;
EXECUTE stmt;

DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
EOF

echo 'exporting tables'
time mysql --skip-column-names -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $DEST_DB >> $TEMP_FILE <<EOF
SELECT CONCAT('CREATE TABLE ','$DEST_DB','.',TABLE_NAME,' LIKE ',TABLE_SCHEMA,'.',TABLE_NAME,';') 
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA='$SRC_DB' AND TABLE_TYPE='BASE TABLE'
EOF


echo 'exporting views'
# we need to login here with the SRC user and password due to sql definer
time mysql --skip-column-names -h$DB_HOST -u$SRC_USERNAME -p$SRC_PASSWORD $SRC_DB >> $TEMP_FILE_VIEWS <<EOF
SELECT CONCAT('CREATE VIEW ','$DEST_DB','.',TABLE_NAME,' AS ',VIEW_DEFINITION, ';')
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA='$SRC_DB'
order by 1 desc
EOF

node -e "let fs=require('fs');fs.writeFileSync('$TEMP_FILE_VIEWS',fs.readFileSync('$TEMP_FILE_VIEWS','utf8').replace(/$SRC_DB/g,'$DEST_DB'));"
cat $TEMP_FILE_VIEWS >> $TEMP_FILE

echo 'exporting foreign keys'
time mysql --skip-column-names -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $DEST_DB >> $TEMP_FILE <<EOF
SELECT CONCAT('ALTER TABLE ','$DEST_DB','.',TABLE_NAME,' ADD CONSTRAINT ',CONSTRAINT_NAME,' FOREIGN KEY(',COLUMN_NAME,')',' REFERENCES \`',REFERENCED_TABLE_NAME,'\`(',REFERENCED_COLUMN_NAME,')', ' ON DELETE ',DELETE_RULE, ' ON UPDATE ', UPDATE_RULE, ';') 
FROM (
  SELECT DISTINCT col_usage.CONSTRAINT_NAME, col_usage.TABLE_NAME, col_usage.COLUMN_NAME,
    col_usage.REFERENCED_TABLE_NAME, col_usage.REFERENCED_COLUMN_NAME, constraints.MATCH_OPTION,
    constraints.UPDATE_RULE, constraints.DELETE_RULE
  FROM information_schema.\`KEY_COLUMN_USAGE\` AS col_usage
  INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS AS constraints ON
    col_usage.CONSTRAINT_NAME = constraints.CONSTRAINT_NAME
    AND  col_usage.table_schema = constraints.CONSTRAINT_SCHEMA
  WHERE 
    table_schema = '$SRC_DB' AND referenced_column_name IS NOT NULL
) as fk
EOF





echo 'creating schema'
time mysql -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $DEST_DB < $TEMP_FILE
# mysqldump --no-data --default-character-set=utf8mb4 -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $SRC_DB |
#   sed -e 's/DEFINER[ ]*=[ ]*[^*]*\*/\*/'  > schema.sql

# mysql -h$DB_HOST -u$DEST_USERNAME -p$DEST_PASSWORD $DEST_DB < schema.sql

# dump and import remaining tables with data
echo 'Importing base table data'

time mysql -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $DEST_DB <<-EOF
SET FOREIGN_KEY_CHECKS = 0;
INSERT INTO SequelizeMeta SELECT * FROM $SRC_DB.SequelizeMeta;
INSERT INTO account_type SELECT * FROM $SRC_DB.account_type;
INSERT INTO atheneum_office SELECT * FROM $SRC_DB.atheneum_office;
INSERT INTO compliance SELECT * FROM $SRC_DB.compliance;
INSERT INTO compliance_type SELECT * FROM $SRC_DB.compliance_type;
INSERT INTO configuration SELECT * FROM $SRC_DB.configuration;
INSERT INTO contract_category SELECT * FROM $SRC_DB.contract_category;
INSERT INTO contract_condition SELECT * FROM $SRC_DB.contract_condition;
INSERT INTO contract_coverage SELECT * FROM $SRC_DB.contract_coverage;
INSERT INTO contract_priority SELECT * FROM $SRC_DB.contract_priority;
INSERT INTO contract_status SELECT * FROM $SRC_DB.contract_status;
INSERT INTO contract_type SELECT * FROM $SRC_DB.contract_type;
INSERT INTO contract_type_detail SELECT * FROM $SRC_DB.contract_type_detail;
INSERT INTO cost_type SELECT * FROM $SRC_DB.cost_type;
INSERT INTO country SELECT * FROM $SRC_DB.country;
INSERT INTO currency SELECT * FROM $SRC_DB.currency;
INSERT INTO cv_source SELECT * FROM $SRC_DB.cv_source;
INSERT INTO deliverable_type SELECT * FROM $SRC_DB.deliverable_type;
INSERT INTO email_template SELECT * FROM $SRC_DB.email_template;
INSERT INTO employee_position SELECT * FROM $SRC_DB.employee_position;
INSERT INTO epl_output_type SELECT * FROM $SRC_DB.epl_output_type;
INSERT INTO epl_preliminary_tag SELECT * FROM $SRC_DB.epl_preliminary_tag;
INSERT INTO epl_reply_status_comment SELECT * FROM $SRC_DB.epl_reply_status_comment;
INSERT INTO epl_status SELECT * FROM $SRC_DB.epl_status;
INSERT INTO epl_status_comment SELECT * FROM $SRC_DB.epl_status_comment;
INSERT INTO epl_status_possible_change SELECT * FROM $SRC_DB.epl_status_possible_change;
INSERT INTO epl_status_to_epl_status_comment SELECT * FROM $SRC_DB.epl_status_to_epl_status_comment;
INSERT INTO experience_visibility_type SELECT * FROM $SRC_DB.experience_visibility_type;
INSERT INTO expert_focus_region SELECT * FROM $SRC_DB.expert_focus_region;
INSERT INTO expert_payment_detail_status SELECT * FROM $SRC_DB.expert_payment_detail_status;
INSERT INTO expert_status SELECT * FROM $SRC_DB.expert_status;
INSERT INTO fee_type SELECT * FROM $SRC_DB.fee_type;
INSERT INTO industry SELECT * FROM $SRC_DB.industry;
INSERT INTO invoice_payment_status SELECT * FROM $SRC_DB.invoice_payment_status;
INSERT INTO invoice_status SELECT * FROM $SRC_DB.invoice_status;
INSERT INTO invoice_type SELECT * FROM $SRC_DB.invoice_type;
INSERT INTO invoicing_coverage SELECT * FROM $SRC_DB.invoicing_coverage;
INSERT INTO invoicing_region SELECT * FROM $SRC_DB.invoicing_region;
INSERT INTO language SELECT * FROM $SRC_DB.language;
INSERT INTO language_proficiency SELECT * FROM $SRC_DB.language_proficiency;
INSERT INTO payment_service_type SELECT * FROM $SRC_DB.payment_service_type;
INSERT INTO payment_status SELECT * FROM $SRC_DB.payment_status;
INSERT INTO payment_transfer_method SELECT * FROM $SRC_DB.payment_transfer_method;
INSERT INTO permission SELECT * FROM $SRC_DB.permission;
INSERT INTO phone_type SELECT * FROM $SRC_DB.phone_type;
INSERT INTO position SELECT * FROM $SRC_DB.position;
INSERT INTO pricing SELECT * FROM $SRC_DB.pricing;
INSERT INTO project_required_resources SELECT * FROM $SRC_DB.project_required_resources;
INSERT INTO project_status SELECT * FROM $SRC_DB.project_status;
INSERT INTO project_type SELECT * FROM $SRC_DB.project_type;
INSERT INTO project_category SELECT * FROM $SRC_DB.project_category;
INSERT INTO reply_status SELECT * FROM $SRC_DB.reply_status;
INSERT INTO special_condition SELECT * FROM $SRC_DB.special_condition;
INSERT INTO sub_industry SELECT * FROM $SRC_DB.sub_industry;
INSERT INTO tax_type SELECT * FROM $SRC_DB.tax_type;
INSERT INTO timezone SELECT * FROM $SRC_DB.timezone;
INSERT INTO user_type SELECT * FROM $SRC_DB.user_type;
INSERT INTO vat_class SELECT * FROM $SRC_DB.vat_class;
INSERT INTO zoom_number SELECT * FROM $SRC_DB.zoom_number;

INSERT INTO address SELECT * FROM $SRC_DB.address WHERE id in (select address_id FROM atheneum_office);

/* INSERT Atheneum Comnpany */
INSERT INTO company SELECT * FROM $SRC_DB.company WHERE id = 49713;

SET FOREIGN_KEY_CHECKS = 1;
EOF

# run node script to add test user to db
echo "dropTriggers"
time node scripts/dropTriggers
echo "migrating"
time npm run migrate
echo "init empty db"
time node e2e-tests/scripts/initEmptyDb
echo "recreateTriggers"
time node scripts/recreateTriggers

echo "updating users"
time mysql -h$DB_HOST -u$DEST_USERNAME -p$DEST_PASSWORD $DEST_DB <<-EOF
UPDATE user set email='test.admin@example.com' WHERE id=1
EOF

# reindex elastic
echo 'Reindexing'
for idx in expert log project contract parent_account account office client invoice list_records; do
  ssh -o StrictHostKeyChecking=no ec2-user@bastion.test1.atheneum-dev.com curl -s -X POST https://services.${DEPLOY_ENV}.atheneum-dev.com/search-service/recreate-index/${idx}
  sleep 1
  ssh -o StrictHostKeyChecking=no ec2-user@bastion.test1.atheneum-dev.com curl -s -X POST https://services.${DEPLOY_ENV}.atheneum-dev.com/search-service/index/${idx} 
done
sleep 5

echo 'Platform DB Reset Complete'



###########################
#### SHERLOCK
###########################

echo 'Resetting sherlock'

# setup sherlock db vars
SHERLOCK_DB_NAME=$(ssm "/${DEPLOY_ENV}/rds/sherlock/dbname")

# truncate sherlock tables
echo 'Truncating Sherlock tabels'
time mysql -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $SHERLOCK_DB_NAME <<-EOF
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE comment;
TRUNCATE TABLE breach;
TRUNCATE TABLE unsubscribe;
TRUNCATE TABLE activity;
TRUNCATE TABLE rule;

INSERT INTO rule SELECT * FROM training_sherlock.rule;
DELETE FROM rule WHERE type = 'expert_id';

INSERT INTO rule (type,value,value_alt,scope,contact_type,scope_id,position_scope,source_service,source,updated_by,valid_from,valid_to,valid,comment,created_at,updated_at,drop_dead) VALUES
	 ('domain','blocked.com',NULL,'global','all',0,0,'sherlock','manual',NULL,'2020-01-01','2100-01-01',1,'','2021-05-19','2021-05-19',0);


SET FOREIGN_KEY_CHECKS=1;
EOF


# sherlock redis seed
echo 'Seeding Sherlock Redis'
ssh -o StrictHostKeyChecking=no ec2-user@bastion.test1.atheneum-dev.com curl -s https://services.${DEPLOY_ENV}.atheneum-dev.com/sherlock/seed-redis 



###########################
#### CAPI
###########################

echo 'Resetting capi'

# setup capi db vars
CAPI_DB_NAME=$(ssm "/${DEPLOY_ENV}/rds/capi-service/dbname")

# truncate capi tables
echo 'Truncating CAPI tabels'
time mysql -h$DB_HOST -u$ADMIN_USERNAME -p$ADMIN_PASSWORD $CAPI_DB_NAME <<-EOF
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE invoice;
TRUNCATE TABLE client_call;
TRUNCATE TABLE email;
TRUNCATE TABLE conversation;
TRUNCATE TABLE expert;
TRUNCATE TABLE workstream;
TRUNCATE TABLE project;
TRUNCATE TABLE client;

INSERT INTO client (capi_client_id,platform_client_id,client_name,createdAt,updatedAt) VALUES
	 ('mckinsey',4,'McKinsey & Company', now(), now());

SET FOREIGN_KEY_CHECKS=1;
EOF

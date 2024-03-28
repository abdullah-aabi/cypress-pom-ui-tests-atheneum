const uuid = require('uuid').v4
const moment = require('moment')
const faker = require('faker')

module.exports = async function createClients (params) {
  const clientIds = []

  for (let i = 0; i < params.recordCount; i++) {
    params.companyName = params.clientObject
      ? params.clientObject.accountName
      : `${faker.company.companyName()} ${faker.company.companySuffix()}`

    params.companyCity = (params.clientObject && params.clientObject.accountName.indexOf('McKinsey') !== -1) ? 'New York' : 'Berlin'
    params.companyCountry = (params.clientObject && params.clientObject.accountName.indexOf('McKinsey') !== -1) ? 'United States' : 'Germany'

    params.firstName = params.clientObject
      ? params.clientObject.clientFirstName
      : faker.name.firstName()

    params.lastName = params.clientObject
      ? params.clientObject.clientLastName
      : faker.name.lastName()

    params.atheneumContactId = params.clientObject
      ? params.clientObject.atheneumContactId
      : null

    params.accountType = params.clientObject
      ? params.clientObject.accountType
      : null

    params.externalComplianceRequired = params.clientObject.externalComplianceRequired
      ? params.clientObject.externalComplianceRequired
      : false

    params.complianceType = params.clientObject.complianceType
      ? params.clientObject.complianceType
      : null

    let addressResult = await createAddress(params)
    params.addressId = addressResult[0].insertId

    await createPhoneToAddress(params)

    let parentAccountResult = await createParentAccount(params)
    params.parentAccountId = parentAccountResult[0].insertId

    let accountResult = await createAccount(params)
    params.accountId = accountResult[0].insertId

    let officeResult = await createOffice(params)
    params.officeId = officeResult[0].insertId

    let clientUserResult = await createClientUser(params)
    params.clientUserId = clientUserResult[0].insertId

    await createUserToPermission(params)

    let clientContactResult = await createClientContact(params)
    params.clientContactId = clientContactResult[0].insertId

    let invoiceEntityResult = await createInvoicingEntity(params)
    params.invoiceEntityId = invoiceEntityResult[0].insertId

    await createInvoicingEntityToClient(params)

    await createContract(params)

    clientIds.push({
      client: {
        parentAccountId: params.parentAccountId,
        accountId: params.accountId,
        officeId: params.officeId,
        addressId: params.addressId,
        clientUserId: params.clientUserId,
        clientContactId: params.clientContactId,
        invoiceEntityId: params.invoiceEntityId
      }
    })
  }
  // eslint-disable-next-line no-console
  console.log(clientIds)
  return clientIds
}

async function createAddress ({
  companyCity,
  companyCountry,
  transaction,
  sequelize
}) {
  const addressQuery = `
  insert into address(id, address_1, city, state, country_id, timezone_id, revision_hash,updated_by,created_at,updated_at)
    VALUES (DEFAULT, :address_1, :city, :state, (Select id from country where name = :country), (Select timezone_id from country where name = :country), :transaction_id, 1, now(), now())`

  const address = {
    address_1: `${faker.address.streetAddress()}, ${companyCity}, ${companyCountry}`,
    city: companyCity,
    state: companyCity,
    country: companyCountry,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(addressQuery, {
    replacements: address,
    transaction
  })

  return res
}

async function createPhoneToAddress ({ addressId, transaction, sequelize }) {
  const phoneToAddressQuery = `
    INSERT INTO phone_to_address (id, address_id, phone_num, phone_type_id, revision_hash, created_at, updated_at)
        VALUES (DEFAULT, :address_id, :phone_number, (SELECT id from phone_type ORDER BY RAND() LIMIT 1), :transaction_id, now(), now())`

  const phone = {
    address_id: addressId,
    phone_number: '493011214253',
    transaction_id: transaction.id
  }

  const res = await sequelize.query(phoneToAddressQuery, {
    replacements: phone,
    transaction
  })
  return res
}

async function createParentAccount ({ companyName, accountType, transaction, sequelize }) {
  let parentAccountQuery = `
  insert into parent_account(id, parent_account_name, parent_account_code, account_type_id, invoicing_coverage_id, hedge_fund_required, contract_counter, case_code_required, experts_disclosed, updated_by,created_at,updated_at,settings)
    VALUES (DEFAULT, :parent_account_name, :parent_account_code, (select id from account_type order by RAND() limit 1), (select id from invoicing_coverage where name = 'Global' limit 1), 0, 0, 1, 1, 1, now(), now(),'')`

  const parentAccount = {
    parent_account_name: companyName,
    parent_account_code: companyName
      .replace(/[^0-9A-Z]+/gi, '')
      .slice(0, 3)
      .toUpperCase()
  }

  if (accountType !== null) {
    parentAccountQuery = `insert into parent_account(id, parent_account_name, parent_account_code, account_type_id, invoicing_coverage_id, hedge_fund_required, contract_counter, case_code_required, experts_disclosed, updated_by,created_at,updated_at,settings)
    VALUES (DEFAULT, :parent_account_name, :parent_account_code, (select id from account_type where name = '${accountType}'), (select id from invoicing_coverage where name = 'Global' limit 1), 0, 0, 1, 1, 1, now(), now(),'')`
  }

  if (parentAccount.parent_account_name.indexOf('McKinsey') !== -1) { parentAccountQuery = parentAccountQuery.replace('DEFAULT', 32) }

  const res = await sequelize.query(parentAccountQuery, {
    replacements: parentAccount,
    transaction
  })

  return res
}

async function createAccount ({
  parentAccountId,
  atheneumContactId,
  companyCountry,
  externalComplianceRequired,
  complianceType,
  companyName,
  transaction,
  sequelize
}) {
  let accountQuery = `
  insert into account(id, company_name, parent_account_id, atheneum_office_id, country_id, updated_by, created_at, updated_at, key_contact_id, external_compliance_required, compliance_type_id,settings)
    VALUES (DEFAULT, :company_name, :parent_account_id, (select id from atheneum_office order by RAND() limit 1), (select id from country where name = :country), 1, now(), now(), :key_contact_id, :external_compliance_required, :compliance_type_id,'')`

  const account = {
    company_name: `${companyName} ${companyCountry}`,
    key_contact_id: atheneumContactId,
    parent_account_id: parentAccountId,
    country: companyCountry,
    external_compliance_required: externalComplianceRequired,
    compliance_type_id: complianceType,
  }

  if (complianceType !== null) {
    accountQuery = `insert into account(id, company_name, parent_account_id, atheneum_office_id, country_id, updated_by, created_at, updated_at, key_contact_id, external_compliance_required, compliance_type_id,settings)
    VALUES (DEFAULT, :company_name, :parent_account_id, (select id from atheneum_office order by RAND() limit 1), (select id from country where name = :country), 1, now(), now(), :key_contact_id, :external_compliance_required, (select id from compliance_type where name ='${complianceType}'),'')`
  }

  if (account.company_name.indexOf('McKinsey') !== -1) { accountQuery = accountQuery.replace('DEFAULT', 1) }

  const res = await sequelize.query(accountQuery, {
    replacements: account,
    transaction
  })

  return res
}

async function createOffice ({
  parentAccountId,
  accountId,
  addressId,
  companyName,
  companyCity,
  transaction,
  sequelize
}) {
  let officeQuery = `
  insert into office(id, office_name, account_id, parent_account_id, address_id, placeholder, updated_by, created_at, updated_at,settings)
    VALUES (DEFAULT, :office_name, :account_id, :parent_account_id, :address_id, 0, 1, now(), now(),'')`

  const office = {
    office_name: `${companyName} ${companyCity}`,
    parent_account_id: parentAccountId,
    account_id: accountId,
    address_id: addressId
  }

  if (office.office_name.indexOf('McKinsey') !== -1) { officeQuery = officeQuery.replace('DEFAULT', 1) }

  const res = await sequelize.query(officeQuery, {
    replacements: office,
    transaction
  })

  return res
}

async function createClientUser ({
  firstName,
  lastName,
  addressId,
  transaction,
  sequelize
}) {
  let userQuery = `
      INSERT INTO user (id, title, first_name, last_name, full_name, username, password, email, user_type_id,login_attempts, platform_invitation_email, status, address_id, confirmed, confirmation_token, password_token, welcomed, revision_hash, updated_by, created_at, updated_at)
      VALUES (DEFAULT, 'Mr.', :first_name, :last_name, :full_name, :username, :password, :email, :user_type_id, 0, false, true, :address_id, true, :confirmation_token, :password_token, true, :transaction_id, 1, now(), now())`

  const user = {
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    password: '$2b$10$yhtqCazpogu8Se4HrwHh2.h7XvdHSvPzBJCONdyuDoUIX7T0Kaj96',
    email: `seed.client.${firstName.toLowerCase()}.${lastName.toLowerCase()}@atheneum.ai`,
    user_type_id: 3,
    address_id: addressId,
    confirmation_token: uuid(),
    password_token: uuid(),
    transaction_id: transaction.id
  }

  if (user.last_name === 'McKinsey') { userQuery = userQuery.replace('DEFAULT', 4) }

  const res = await sequelize.query(userQuery, {
    replacements: user,
    transaction
  })

  return res
}

async function createUserToPermission ({
  clientUserId,
  transaction,
  sequelize
}) {
  const userToPermissionQuery = `
      INSERT INTO user_to_permission (id, user_id, permission_id, created_at, updated_at)
      VALUES (DEFAULT, :user_id, :permission_id, now(), now())`

  const userPermission = {
    user_id: clientUserId,
    permission_id: 7
  }

  const res = await sequelize.query(userToPermissionQuery, {
    replacements: userPermission,
    transaction
  })

  return res
}

async function createClientContact ({
  clientUserId,
  officeId,
  accountId,
  atheneumContactId,
  transaction,
  sequelize
}) {
  const clientQuery = `
  insert into client(id, user_id, office_id, account_id, office_address, position, knowledge_manager, global, revision_hash, updated_by, created_at, updated_at, atheneum_contact_id, compliance_auditor)
    VALUES (DEFAULT, :user_id, :office_id, :account_id, :address_id, :position, 1, 1, :revision_hash, 1, now(), now(), :atheneum_contact_id, true)`

  const client = {
    user_id: clientUserId,
    office_id: officeId,
    account_id: accountId,
    atheneum_contact_id: atheneumContactId,
    address_id: 1,
    position: 'Director Research & Knowledge Center',
    revision_hash: transaction.id
  }

  const res = await sequelize.query(clientQuery, {
    replacements: client,
    transaction
  })

  return res
}

async function createInvoicingEntity ({
  parentAccountId,
  firstName,
  lastName,
  addressId,
  companyCountry,
  companyName,
  transaction,
  sequelize
}) {
  let invoicingEntityQuery = `
  insert into invoicing_entity(id, parent_account_id, legal_name, first_name, last_name, email, address_id, vat_number, gl_code, comment, invoicing_region_id, updated_by, created_at, updated_at, is_global)
    VALUES (DEFAULT, :parent_account_id, :legal_name, :first_name, :last_name, :email, :address_id, :vat_number, :gl_code, :comment, (select id from invoicing_region where name = 'EMEA'), 1, now(), now(), 1)`

  const emailAddress = `seed.client.${firstName.toLowerCase()}.${lastName.toLowerCase()}@atheneum.ai`

  const invoicingEntity = {
    parent_account_id: parentAccountId,
    legal_name: `${companyName} ${companyCountry}`,
    first_name: firstName,
    last_name: lastName,
    email: emailAddress,
    address_id: addressId,
    vat_number: 'NL805107472B01',
    gl_code: '102110000',
    comment: `<p>payment terms 30 days</p><p><a href="mailto:${emailAddress}">${emailAddress}</a></p>`
  }

  if (invoicingEntity.legal_name === 'McKinsey & Company United States') {
    invoicingEntityQuery = `
    insert into invoicing_entity(id, parent_account_id, legal_name, first_name, last_name, email, address_id, vat_number, gl_code, comment, invoicing_region_id, updated_by, created_at, updated_at, is_global, legal_entity_address)
    VALUES (2490, :parent_account_id, :legal_name, :first_name, :last_name, :email, :address_id, :vat_number, :gl_code, :comment, (select id from invoicing_region where name = 'NA'), 1, now(), now(), 1, '159 Stiedemann Glen, New York, United States'),
    (2054, :parent_account_id, 'marketing calls', NULL, NULL, NULL, :address_id, NULL, 100007000, :comment, (select id from invoicing_region where name = 'EMEA'), 1, now(), now(), NULL, '159 Stiedemann Glen, New York, United States'),
    (2491, :parent_account_id, 'McKinsey & Company Dominican Republic', :first_name, :last_name, :email, :address_id, :vat_number, :gl_code, :comment, (select id from invoicing_region where name = 'LATAM'), 1, now(), now(), NULL, 'Regus Santo Domingo, Robel Corporate Center, 7th Floor, Suits 703 & 706, Rafael Augusto Sanchez No. 86, Piantini, Santo Domingo, Dominican Republic'),
    (2492, :parent_account_id, 'McKinsey & Consulting Company Inc., Shanghai', :first_name, :last_name, :email, :address_id, :vat_number, :gl_code, :comment, (select id from invoicing_region where name = 'APAC'), 1, now(), now(), NULL, '17F Platinum No. 233 Tai Cang Road, Shanghai, 200020, People Republic of China'),
    (2493, :parent_account_id, 'McKinsey & Company Argentina', :first_name, :last_name, :email, :address_id, :vat_number, :gl_code, :comment, (select id from invoicing_region where name = 'NA'), 1, now(), now(), NULL, 'Av. Leandro N. Alem 855, Piso 24, Buenos Aires, C1001AAD, ARG, Argentina'),
    (2494, :parent_account_id, 'McKinsey & Company Romania', :first_name, :last_name, :email, :address_id, :vat_number, :gl_code, :comment, (select id from invoicing_region where name = 'EMEA'), 1, now(), now(), NULL, 'Iuliu Maniu, Bucharest')`
  }

  const res = await sequelize.query(invoicingEntityQuery, {
    replacements: invoicingEntity,
    transaction
  })

  return res
}

async function createInvoicingEntityToClient ({
  invoiceEntityId,
  clientUserId,
  transaction,
  sequelize
}) {
  const invoicingEntityQuery = `
  insert into invoicing_entity_to_client(id, invoicing_entity_id, client_id, updated_by, created_at, updated_at)
    VALUES (DEFAULT, :invoice_entity_id, :client_id, 1, now(), now())`
  const invoicingEntity = {
    invoice_entity_id: invoiceEntityId,
    client_id: clientUserId
  }

  const res = await sequelize.query(invoicingEntityQuery, {
    replacements: invoicingEntity,
    transaction
  })

  return res
}

async function createContract ({
  parentAccountId, clientContactId,
  companyName,
  transaction,
  sequelize
}) {
  const contractQuery = `
  insert into contract(id, parent_account_id, client_contact_id, employee_contact_id, contract_reference, contract_coverage_id, contract_type_id, contract_type_detail_id, signed, contract_status_id, range_max,
    range_min, currency_id, unlimited, start_date, end_date, margin_prediction_in_fee_value, fee_overcharge_limit, range_max_converted, standard_fees, atheneum_office_id ,updated_by, created_at, updated_at, revision_hash)
    VALUES (DEFAULT, :parent_account_id, :client_contact_id, 1, :contract_reference, (SELECT id FROM contract_coverage WHERE name = 'Global'), (SELECT id FROM contract_type WHERE name = 'PAYG'),
    (SELECT id FROM contract_type_detail WHERE name = 'Final'), 1, (SELECT id FROM contract_status WHERE name = 'Active'), :range_max, :range_min, (SELECT id FROM currency WHERE name = 'USD'), 1, :start_date, :end_date, 0,
    :fee_overcharge_limit, :range_max_converted, :standard_fees, 1, 1, now(), now(), :revision_hash)`
  const contractData = {
    parent_account_id: parentAccountId,
    client_contact_id: clientContactId,
    contract_reference: `${companyName
      .replace(/[^0-9A-Z]+/gi, '')
      .slice(0, 3)
      .toUpperCase()}-001-PAY`,
    range_min: 10000000,
    range_max: 50000000,
    fee_overcharge_limit: 200,
    range_max_converted: 458121719,
    standard_fees: null,
    start_date: moment().format('YYYY-MM-DD'),
    end_date: moment().add(30, 'days').format('YYYY-MM-DD'),
    revision_hash: transaction.id
  }

  if (companyName.indexOf('McKinsey') !== -1) contractData.standard_fees = '{"Global":{"Per hour":{"Expert":775,"Senior":875,"Premium":975},"Per day":{"Expert":5000},"Per half hour":{"Expert":480,"Senior":580,"Premium":680}},"India":{"Per hour":{"Expert":540,"Senior":580,"Premium":580},"Per day":{"Expert":3000},"Per half hour":{"Expert":480}},"China":{"Per hour":{"Expert":540,"Senior":580,"Premium":580},"Per day":{"Expert":3000},"Per half hour":{"Expert":480}}}'

  const res = await sequelize.query(contractQuery, {
    replacements: contractData,
    transaction
  })

  return res
}

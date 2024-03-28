const uuid = require('uuid').v4
const faker = require('faker')
const moment = require('moment')

module.exports = async function createExperts (params) {
  const expertIds = []
  params.companyCity = 'Berlin'
  params.companyCountry = 'Germany'
  params.complianceSigned = (typeof params.complianceSigned === 'boolean')
    ? params.complianceSigned
    : false

  params.expertStatus = (typeof params.expertStatus === 'string')
    ? params.expertStatus
    : false

  params.sherlockBlocked = (typeof params.sherlockBlocked === 'boolean')
    ? params.sherlockBlocked
    : false

  params.confirmedPaymentDetails = (typeof params.confirmedPaymentDetails === 'boolean')
    ? params.confirmedPaymentDetails
    : false

  for (let i = 0; i < params.recordCount; i++) {
    let expertStatusResult = await getExpertStatus(params)
    params.expertStatusId = expertStatusResult[0][0].id

    let addressResult = await createAddress(params)
    params.addressId = addressResult[0].insertId

    await createPhoneToAddress(params)

    let expertUserResult = await createExpertUser(params)
    params.expertUserId = expertUserResult[0].insertId

    await createUserToPermission(params)

    await createLanguageToUser(params)

    let cvResult = await createCurriculumVitae(params)
    params.cvId = cvResult[0].insertId

    await createPaymentDetail(params)

    let experienceResult = await createExperience(params)

    let subIndustryResult = await getSubIndustry(params)
    params.subIndustry = subIndustryResult

    let expertResult = await createExpert(params)
    params.expertId = expertResult[0].insertId

    await createSubIndustryToExpert(params)

    expertIds.push({
      expert: {
        addressId: params.addressId,
        expertUserId: params.expertUserId,
        expertId: params.expertId,
        cvId: params.cvId,
        experienceId: experienceResult[0].insertId
      }
    })
  }
  // eslint-disable-next-line no-console
  console.log(expertIds)
  return expertIds
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

async function getExpertStatus ({ expertStatus, transaction, sequelize }) {
  let expertStatusQuery = `select id from expert_status order by RAND() limit 1`

  if (expertStatus) {
    expertStatusQuery = `select id from expert_status where name = '${expertStatus}' limit 1`
  }

  const res = await sequelize.query(expertStatusQuery, {
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
    phone_number: faker.phone.phoneNumber('+48 ## ### ## ##'),
    transaction_id: transaction.id
  }

  const res = await sequelize.query(phoneToAddressQuery, {
    replacements: phone,
    transaction
  })
  return res
}

async function createExpertUser ({
  expertObject,
  sherlockBlocked,
  addressId,
  transaction,
  sequelize
}) {
  const userQuery = `
      INSERT INTO user (id, title, first_name, last_name, full_name, username, password, email, user_type_id,login_attempts, platform_invitation_email, status, address_id, confirmed, confirmation_token, password_token, welcomed, revision_hash, updated_by, created_at, updated_at)
      VALUES (DEFAULT, 'Mr.', :first_name, :last_name, :full_name, :username, :password, :email, :user_type_id, 0, false, true, :address_id, true, :confirmation_token, :password_token, true, :transaction_id, 1, now(), now())`

  const firstName = expertObject
    ? expertObject.firstName
    : faker.name.firstName()
  const lastName = expertObject ? expertObject.lastName : faker.name.lastName()

  const user = {
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    password: '$2b$10$yhtqCazpogu8Se4HrwHh2.h7XvdHSvPzBJCONdyuDoUIX7T0Kaj96',
    email: `seed.expert.${firstName.toLowerCase()}.${lastName.toLowerCase()}@atheneum.ai`,
    address_id: addressId,
    user_type_id: 2,
    confirmation_token: uuid(),
    password_token: uuid(),
    transaction_id: transaction.id
  }

  if (sherlockBlocked) {
    user.email = `seed.expert.${firstName.toLowerCase()}.${lastName.toLowerCase()}@blocked.com`
  }

  const res = await sequelize.query(userQuery, {
    replacements: user,
    transaction
  })

  return res
}

async function createLanguageToUser ({ expertUserId, transaction, sequelize }) {
  const languageToUserQuery = `
    INSERT INTO language_to_user (id, user_id, language_id, language_proficiency_id, revision_hash, created_at, updated_at)
    VALUES (DEFAULT, :user_id, (SELECT id from language ORDER BY RAND() LIMIT 1), (SELECT id from language_proficiency ORDER BY RAND() LIMIT 1), :transaction_id ,now(), now())`

  const language = {
    user_id: expertUserId,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(languageToUserQuery, {
    replacements: language,
    transaction
  })
  return res
}

async function createUserToPermission ({
  expertUserId,
  transaction,
  sequelize
}) {
  const userToPermissionQuery = `
      INSERT INTO user_to_permission (id, user_id, permission_id, created_at, updated_at)
      VALUES (DEFAULT, :user_id, :permission_id, now(), now())`

  const userPermission = {
    user_id: expertUserId,
    permission_id: 8
  }

  const res = await sequelize.query(userToPermissionQuery, {
    replacements: userPermission,
    transaction
  })

  return res
}

async function getSubIndustry ({ transaction, sequelize }) {
  const subIndustryQuery = `
      SELECT * FROM sub_industry WHERE selectable = 1 ORDER BY RAND() limit 1`

  const res = await sequelize.query(subIndustryQuery, {
    transaction
  })

  return res[0][0]
}

async function createExpert ({
  expertStatusId,
  complianceSigned,
  expertUserId,
  subIndustry,
  transaction,
  sequelize
}) {
  const expertQuery = `
      INSERT INTO expert (id, user_id, industry_expertise, industry_id, expert_code, compliance_signed, compliance_date, expert_status_id, hourly_rate_currency_id, hourly_rate, created_at, updated_at, updated_by, is_profile_created, send_sms_reminders, is_profile_confirmed)
      VALUES (DEFAULT, :user_id, :industry_expertise, :industry_id, :expert_code, :compliance_signed, :compliance_date, :expert_status_id, 1, :hourly_rate, now(), now(), 1, 1, 0, :profile_confirmed)`

  const expert = {
    user_id: expertUserId,
    industry_expertise: `<p>Expertise in ${subIndustry.name}</p>`,
    industry_id: subIndustry.industry_id,
    expert_status_id: expertStatusId,
    expert_code: `EX-${expertUserId}`,
    compliance_signed: complianceSigned,
    compliance_date: null,
    profile_confirmed: null,
    hourly_rate: 357000000
  }

  if (expert.compliance_signed === true) {
    expert.compliance_date = moment().format('YYYY-MM-DD hh:mm:ss')
    expert.profile_confirmed = 1
  }

  const res = await sequelize.query(expertQuery, {
    replacements: expert,
    transaction
  })

  return res
}

async function createSubIndustryToExpert ({
  expertId,
  subIndustry,
  transaction,
  sequelize
}) {
  const subIndustryToExpertQuery = `
      INSERT INTO sub_industry_to_expert (id, expert_id, sub_industry_id, revision_hash, created_at, updated_at)
      VALUES (DEFAULT, :expert_id, :sub_industry_id, :transaction_id, now(), now())`

  const expertSubIndustry = {
    expert_id: expertId,
    sub_industry_id: subIndustry.id,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(subIndustryToExpertQuery, {
    replacements: expertSubIndustry,
    transaction
  })

  return res
}

async function createPaymentDetail ({ confirmedPaymentDetails, addressId, expertUserId, transaction, sequelize }) {
  let paymentDetailQuery = `
  INSERT INTO expert_payment_detail (id, expert_id, invoice_needed, vat_class, expert_address, expert_payment_detail_status_id, created_at, updated_at)
  VALUES (DEFAULT, :expert_id, 0, 0, 0, 2, now(), now())`

  if (confirmedPaymentDetails) {
    paymentDetailQuery = `
    INSERT INTO expert_payment_detail (id, expert_id, payment_service_type_id, invoice_needed, vat_class, company_name,
       expert_address, vat_number, address_id, comment, account_owner, account_number, bank_code, bank_name, bank_address_id, payment_transfer_method_id, expert_payment_detail_status_id, status_changed_date, confirmation_date, created_at, updated_at)
    VALUES (DEFAULT, :expert_id, 2, 1, 19, :company_name, 0, 
      :vat_number, :address_id, :comment, :account_owner, :account_number, :bank_code, :bank_name, :address_id, (SELECT id from payment_transfer_method where name = 'Direct transfer' LIMIT 1), (SELECT id from expert_payment_detail_status where name = 'Confirmed' LIMIT 1), now(), now(), now(), now())`
  }

  const paymentDetails = {
    expert_id: expertUserId,
    vat_number: "DE123456",
    address_id: addressId,
    company_name: faker.company.companyName(),
    bank_name: faker.company.companyName(),
    account_owner: faker.finance.accountName(),
    account_number: faker.finance.bitcoinAddress(),
    bank_code: "SWIFT1122",
    comment: "Please pay at the beginning of each month!"
  }

  const res = await sequelize.query(paymentDetailQuery, {
    replacements: paymentDetails,
    transaction
  })

  return res
}

async function createCurriculumVitae ({
  expertUserId,
  transaction,
  sequelize
}) {
  const curriculumVitaeQuery = `
      INSERT INTO curriculum_vitae (id, expert_id, current, created_at, updated_at)
      VALUES (DEFAULT, :expert_id, 1, now(), now())`

  const cv = {
    expert_id: expertUserId
  }

  const res = await sequelize.query(curriculumVitaeQuery, {
    replacements: cv,
    transaction
  })

  return res
}

async function createExperience ({ cvId, transaction, sequelize }) {
  const experienceQuery = `
      INSERT INTO experience (id, cv_id, start_date, current, revision_hash, created_at, updated_at, company_id, position_id)
      VALUES (DEFAULT, :cv_id, :start_date, 1, :revision_hash,  now(), now(), (select id from company order by rand() limit 1), (select id from position order by rand() limit 1))`

  const cv = {
    cv_id: cvId,
    start_date: moment().format('YYYY-MM-DD'),
    revision_hash: transaction.id
  }

  const res = await sequelize.query(experienceQuery, {
    replacements: cv,
    transaction
  })

  return res
}

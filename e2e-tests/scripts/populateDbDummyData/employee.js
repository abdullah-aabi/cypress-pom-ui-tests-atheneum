const uuid = require('uuid').v4
const faker = require('faker')
const moment = require('moment')
const employeePositionsObject = require('./employee_positions')

async function createEmployees(params) {
  let userIds = []

  if (
    params.employeeRole !== undefined &&
    employeePositionsObject.hasOwnProperty(
      params.employeeRole.toLowerCase().replace(/\s/g, '')
    )
  ) {
    params.employeeRole = params.employeeRole.toLowerCase().replace(/\s/g, '')
  } else {
    params.employeeRole = 'accountmanager'
  }

  params.employeePosition = employeePositionsObject[params.employeeRole]
  params.companyCity = 'Berlin'
  params.companyCountry = 'Germany'

  for (let i = 0; i < params.recordCount; i++) {
    let addressResult = await createAddress(params)
    params.addressId = addressResult[0].insertId

    await createPhoneToAddress(params)

    let userResult = await createUser(params)
    params.userId = userResult[0].insertId

    await createLanguageToUser(params)

    let employeeResult = await createEmployee(params)

    await createUserToPermission(params)

    await createEmployeeToPosition(params)

    await assignFeatures(params)

    userIds.push({
      employee: {
        userId: params.userId,
        employeeId: employeeResult[0].insertId,
        positionName: params.employeePosition.positionName
      }
    })
  }
  return userIds
}

async function assignFeatures({ userId, usersObject, transaction, sequelize }) {
  const features = usersObject.features
  if (!features) return

  const query = `
    INSERT INTO user_to_feature(id, feature_id, user_id, enabled, updated_by, created_at, updated_at)
    VALUES(DEFAULT,(select id from feature where lower(name) = :feature), :user_id, 1, :user_id, now(), now())`

  if (features.length)
    await Promise.all(
      features.map(async feature => {
        const featureQuery = {
          user_id: userId,
          feature
        }

        await sequelize.query(query, {
          replacements: featureQuery,
          transaction
        })
      })
    )

  return true
}

async function updateEmployeePosition({
  employeeId,
  updateData,
  transaction,
  sequelize
}) {
  let updateKeyPair = `${updateData[0].column}=${updateData[0].value}`
  for (let i = 1; i < updateData.length; i++) {
    updateKeyPair += `,${updateData[i].column}=${updateData[i].value}`
  }

  const updateQuery = `
  update employee_to_position set ${updateKeyPair} where employee_id = ${employeeId} `

  const res = await sequelize.query(updateQuery, {
    transaction
  })

  return res
}

async function createAddress({
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

async function createUser({
  usersObject,
  addressId,
  employeeRole,
  transaction,
  sequelize
}) {
  let userQuery = `
    INSERT INTO user(id, title, first_name, last_name, full_name, username, password, email, user_type_id, login_attempts, platform_invitation_email, status, address_id, confirmed, confirmation_token, password_token, welcomed, revision_hash, updated_by, created_at, updated_at)
    VALUES(DEFAULT, 'Mr.', :first_name, :last_name, :full_name, :username, :password, :email, 1, 0, true, true, :address_id, true, :confirmation_token, :password_token, true, :transaction_id, 1, now(), now())`

  const firstName =
    usersObject && usersObject.firstName
      ? usersObject.firstName
      : faker.name.firstName()
  const lastName =
    usersObject && usersObject.lastName
      ? usersObject.lastName
      : faker.name.lastName()
  const email = usersObject
    ? usersObject.emailAddress
    : `seed.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${employeeRole}@atheneum.ai`
  const password =
    usersObject && usersObject.password
      ? usersObject.password
      : '$2b$10$yhtqCazpogu8Se4HrwHh2.h7XvdHSvPzBJCONdyuDoUIX7T0Kaj96'

  const password_token =
    usersObject !== undefined && usersObject.resetPassword === true
      ? '74eca3419151cfde773a5c5c7c9a7159'
      : uuid()

  const user = {
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    password,
    email,
    address_id: addressId,
    confirmation_token: uuid(),
    password_token,
    transaction_id: transaction.id
  }

  if (user.username === 'test.accountmanager') {
    userQuery = userQuery.replace('DEFAULT', 2)
  } else if (user.username === 'test.associate') {
    userQuery = userQuery.replace('DEFAULT', 3)
  }

  const res = await sequelize.query(userQuery, {
    replacements: user,
    transaction
  })

  return res
}

async function createEmployee({ userId, zoomUserId, transaction, sequelize }) {
  const employeeQuery = `
    INSERT INTO employee(id, user_id, atheneum_office_id, zoom_user_id, rydoo_payroll_entity_id, created_at, updated_at)
    VALUES(DEFAULT, :user_id, :atheneum_office_id, :zoom_user_id, :rydoo_payroll_entity_id, now(), now())`

  const employee = {
    user_id: userId,
    atheneum_office_id: 1,
    zoom_user_id: zoomUserId,
    rydoo_payroll_entity_id: 1
  }

  const res = await sequelize.query(employeeQuery, {
    replacements: employee,
    transaction
  })
  return res
}

async function createLanguageToUser({ userId, transaction, sequelize }) {
  const languageToUserQuery = `
    INSERT INTO language_to_user(id, user_id, language_id, language_proficiency_id, revision_hash, created_at, updated_at)
    VALUES(DEFAULT, :user_id, (SELECT id from language ORDER BY RAND() LIMIT 1), (SELECT id from language_proficiency ORDER BY RAND() LIMIT 1), :transaction_id, now(), now())`

  const language = {
    user_id: userId,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(languageToUserQuery, {
    replacements: language,
    transaction
  })
  return res
}

async function createPhoneToAddress({ addressId, transaction, sequelize }) {
  const phoneToAddressQuery = `
    INSERT INTO phone_to_address(id, address_id, phone_num, phone_type_id, revision_hash, created_at, updated_at)
    VALUES(DEFAULT, :address_id, :phone_number, (SELECT id from phone_type ORDER BY RAND() LIMIT 1), :transaction_id, now(), now())`

  const phone = {
    address_id: addressId,
    phone_number: '123243112134',
    transaction_id: transaction.id
  }

  const res = await sequelize.query(phoneToAddressQuery, {
    replacements: phone,
    transaction
  })
  return res
}

async function createEmployeeToPosition({
  userId,
  employeePosition,
  transaction,
  sequelize
}) {
  const employeeToPositionQuery = `
    INSERT INTO employee_to_position(id, employee_id, employee_position_id, effective_date, position_description, hourly_rate, currency_id, revision_hash, created_at, updated_at, target_margin, is_latest)
    VALUES(DEFAULT, :user_id, (select id from employee_position where lower(name) = :employee_role), :effective_date, :position_description, :hourly_rate, 1, :transaction_id, now(), now(), :target_margin, true)`

  const employee = {
    user_id: userId,
    employee_role: employeePosition.positionName,
    effective_date: moment().format('YYYY-MM-00'),
    hourly_rate: '357000000',
    target_margin: '100',
    position_description: `Test ${employeePosition.positionName} `,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(employeeToPositionQuery, {
    replacements: employee,
    transaction
  })
  return res
}

async function createUserToPermission({
  employeePosition,
  userId,
  transaction,
  sequelize
}) {
  let result = []

  for (let i = 0; i < employeePosition.permissions.length; i++) {
    const userToPermissionQuery = `
    INSERT INTO user_to_permission(id, user_id, permission_id, created_at, updated_at)
    VALUES(DEFAULT, :user_id, :permission_id, now(), now())`

    const userPermission = {
      user_id: userId,
      permission_id: employeePosition.permissions[i]
    }

    const res = await sequelize.query(userToPermissionQuery, {
      replacements: userPermission,
      transaction
    })
    result.push(res)
  }

  return result
}

module.exports = { createEmployees, updateEmployeePosition }

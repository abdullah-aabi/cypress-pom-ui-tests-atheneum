const moment = require('moment')
const faker = require('faker')

module.exports = async function createFees (params) {
  for (let i = 0; i < params.epls.length; i++) {
    params.epl = params.epls[i].epl
    let deliverableResult = await createDeliverable(params)
    params.deliverableId = deliverableResult[0].insertId

    let feeResult = await createFee(params)
    params.feeId = feeResult[0].insertId

    await createFeeItem(params)
    await createEmployeeToFee(params)
    await createConsultationPaymentDetail(params)
    await createExpertProjectFeedback(params)
  }
}

async function createDeliverable ({ epl, employee, transaction, sequelize }) {
  const deliverableQuery = `
      INSERT INTO deliverable (id, name, deliverable_type_id, project_id, updated_by, created_at, updated_at)
      VALUES (DEFAULT, :name, :deliverable_type_id, :project_id, :employee_id, now(), now())`

  const deliverable = {
    name: 'ES - Conference Call - Seed Expert',
    deliverable_type_id: 1,
    project_id: epl.projectId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(deliverableQuery, {
    replacements: deliverable,
    transaction
  })

  return res
}

async function createFee ({
  epl,
  deliverableId,
  employee,
  transaction,
  sequelize
}) {
  const feeQuery = `
      INSERT INTO fee (id, expert_id, expert_project_link_id, project_id, deliverable_id, units, delivered_by, delivery_date, consultation_duration, invoice_ready, not_deleted, updated_by, created_at, updated_at, revision_hash)
      VALUES (DEFAULT, :expert_id, :expert_project_link_id, :project_id, :deliverable_id, 0, :employee_id, :delivery_date, 60, 0, 1, :employee_id, now(), now(), :revision_hash)`

  const fee = {
    name: 'ES - Conference Call - Seed Expert',
    expert_id: epl.expertUserId,
    expert_project_link_id: epl.eplId,
    deliverable_id: deliverableId,
    project_id: epl.projectId,
    employee_id: employee[0].employee.userId,
    delivery_date: moment().format('YYYY-MM-DD'),
    revision_hash: transaction.id
  }

  const res = await sequelize.query(feeQuery, {
    replacements: fee,
    transaction
  })

  return res
}

async function createFeeItem ({ feeId, employee, transaction, sequelize }) {
  const feeItemQuery = `
      INSERT INTO fee_item (id, fee_id, value, currency_id, converted, conversion_rate, cost_type_id, fee_type_id, is_billable_to_client, updated_by, created_at, updated_at, revision_hash)
      VALUES (DEFAULT, :fee_id, 300000000, 1, 300000000, 1000000, NULL, 1, NULL, :employee_id, now(), now(), :revision_hash),
      (DEFAULT, :fee_id, 357000000, 1, 357000000, 1000000, 1, NULL, 0, :employee_id, now(), now(), :revision_hash)`

  const feeItem = {
    fee_id: feeId,
    employee_id: employee[0].employee.userId,
    revision_hash: transaction.id
  }

  const res = await sequelize.query(feeItemQuery, {
    replacements: feeItem,
    transaction
  })

  return res
}

async function createEmployeeToFee ({
  feeId,
  employee,
  transaction,
  sequelize
}) {
  const employeeToFeeQuery = `
      INSERT INTO employee_to_fee (id, fee_id, employee_id, units, updated_by, created_at, updated_at)
      VALUES (DEFAULT, :fee_id, :employee_id, 0, :employee_id, now(), now())`

  const employeeToFee = {
    fee_id: feeId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(employeeToFeeQuery, {
    replacements: employeeToFee,
    transaction
  })

  return res
}

async function createConsultationPaymentDetail ({
  epl,
  feeId,
  employee,
  transaction,
  sequelize
}) {
  const consultationPaymentDetailQuery = `
      INSERT INTO consultation_payment_detail (id, expert_project_link_id, fee_id, payment_status_id, delivery_date, invoice_number, vat_class, expert_id, payment_service_type_id, invoice_needed, company_name, vat_number, expert_address, address_id, payment_transfer_method_id,
        account_owner, account_number, bank_code, bank_name, bank_address_id, pay_pal_email, comment, updated_by, created_at, updated_at)
      VALUES (DEFAULT, :expert_project_link_id, :fee_id, 2, :delivery_date, :invoice_number, 0, :expert_id, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, :employee_id, now(), now())`

  const consultation = {
    invoice_number: faker.random.number(),
    expert_project_link_id: epl.eplId,
    expert_id: epl.expertUserId,
    delivery_date: moment().format('YYYY-MM-DD'),
    fee_id: feeId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(consultationPaymentDetailQuery, {
    replacements: consultation,
    transaction
  })

  return res
}

async function createExpertProjectFeedback ({
  epl,
  employee,
  transaction,
  sequelize
}) {
  const expertProjectFeedbackQuery = `
      INSERT INTO expert_project_feedback (id, expert_id, expert_project_link_id, date_sent, updated_by, created_at, updated_at, hash)
      VALUES (DEFAULT, :expert_id, :expert_project_link_id, :date_sent, :employee_id, now(), now(), :hash)`

  const expertFeedback = {
    expert_id: epl.expertUserId,
    expert_project_link_id: epl.eplId,
    date_sent: moment().format('YYYY-MM-DD hh:mm:ss'),
    employee_id: employee[0].employee.userId,
    hash: transaction.id
  }

  const res = await sequelize.query(expertProjectFeedbackQuery, {
    replacements: expertFeedback,
    transaction
  })

  return res
}

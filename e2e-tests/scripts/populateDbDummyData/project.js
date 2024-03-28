const crypto = require('crypto')
const faker = require('faker')
const moment = require('moment')

module.exports = async function createProjects (params) {
  const projectIds = []
  const segments = []
  let clientsIterator = 0

  for (let i = 0; i < params.recordCount; i++) {
    if (clientsIterator === params.clients.length) {
      clientsIterator = 0
    }

    params.clientData = params.clients[clientsIterator].client

    let subIndustryResult = await getSubIndustry(params)
    params.subIndustry = subIndustryResult

    let projectResult = await createProject(params)
    params.projectId = projectResult[0].insertId

    await createProjectStatusChange(params)

    await createClientToProject(params)

    await createEmployeeToProject(params)

    await createBookmark(params)

    for (let segment = 0; segment < params.segmentsCount; segment++) {
      params.segment = segment + 1
      params.employeeIdToSegment = params.employee[segment].employee.userId

      let segmentResult = await createSegment(params)
      params.segmentId = segmentResult[0].insertId

      let segmentScreeningQuestionResult = await createSegmentScreeningQuestion(
        params
      )
      params.segmentScreeningQuestionId =
        segmentScreeningQuestionResult[0].insertId

      await updateSegmentScreeningQuestionId(params)

      await createEmployeeToSegment(params)

      segments.push({
        segmentId: params.segmentId,
        employeeId: params.employeeIdToSegment,
        segmentScreeningQuestionId: params.segmentScreeningQuestionId
      })
    }

    projectIds.push({
      project: {
        projectId: params.projectId,
        segmentsCount: params.segmentsCount,
        segments
      }
    })

    clientsIterator++
  }
  // eslint-disable-next-line no-console
  console.log(projectIds)
  return projectIds
}

async function getSubIndustry ({ transaction, sequelize }) {
  const subIndustryQuery = `
        Select * from sub_industry order by RAND() limit 1`

  const res = await sequelize.query(subIndustryQuery, {
    transaction
  })

  return res[0][0]
}

async function createProject ({
  clientData,
  employee,
  subIndustry,
  transaction,
  sequelize
}) {
  const projectQuery = `
      INSERT INTO project (id, hash, revision_hash, project_name, office_id, account_id, parent_account_id, project_type_id, project_status_id,
        project_required_resources_id, atheneum_code, start_date, industry_id, sub_industry_id, background, compliance_agreement,
        send_notification, atheneum_office_id, created_at, updated_at, updated_by, interview_target, in_proposal,
        is_assignment_reminder_sent, send_compliance_reminders, hide_expert_experience, additional_client_arangements, settings)
      VALUES (DEFAULT, :hash, :transaction_id, :project_name, :office_id, :account_id, :parent_account_id, (select id from project_type order by RAND() limit 1),
      :project_status_id, (select id from project_required_resources order by RAND() limit 1), :atheneum_code, :start_date, :industry_id, :sub_industry_id,
      :background, :compliance_agreement, :send_notification, 1, now(), now(), :updated_by, :interview_target, :in_proposal, :is_assignment_reminder_sent, :send_compliance_reminders, :hide_expert_experience,
      'None','')`

  const project = {
    project_name: `Project Created By DB Seed Script for ${faker.commerce.productName()}`,
    office_id: clientData.officeId,
    account_id: clientData.accountId,
    start_date: moment()
      .add(1, 'M')
      .format('YYYY-MM-DD'),
    parent_account_id: clientData.parentAccountId,
    project_status_id: 1,
    atheneum_code: '',
    industry_id: subIndustry.industry_id,
    sub_industry_id: subIndustry.industry_id,
    background: '<p>Seed project Automobiles, machinary, Tools</p>',
    compliance_agreement: faker.random.boolean(),
    send_notification: faker.random.boolean(),
    interview_target: faker.random.number(),
    in_proposal: faker.random.boolean(),
    updated_by: employee[0].employee.userId,
    is_assignment_reminder_sent: faker.random.boolean(),
    send_compliance_reminders: faker.random.boolean(),
    hide_expert_experience: faker.random.boolean(),
    transaction_id: transaction.id
  }

  const secret = 'atheneum-secret-test'
  project.hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(project))
    .digest('hex')

  const res = await sequelize.query(projectQuery, {
    replacements: project,
    transaction
  })

  return res
}

async function createProjectStatusChange ({
  employee,
  projectId,
  transaction,
  sequelize
}) {
  const projectStatusChangesQuery = `
    INSERT INTO project_status_changes (id, project_status_id, project_id, start_date, created_at, updated_at, updated_by)
    VALUES (DEFAULT, 1, :project_id, now(), now(), now(), :employee_id)`

  const statusChange = {
    project_id: projectId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(projectStatusChangesQuery, {
    replacements: statusChange,
    transaction
  })

  return res
}

async function createClientToProject ({
  clientData,
  projectId,
  transaction,
  sequelize
}) {
  const clientToProjectQuery = `
    INSERT INTO client_to_project (id, revision_hash, client_id, project_id, created_at, updated_at)
    VALUES (DEFAULT, :transaction_id, :client_id, :project_id, now(), now())`

  const client = {
    project_id: projectId,
    client_id: clientData.clientUserId,
    start_date: moment()
      .add(1, 'M')
      .format('YYYY-MM-DD'),
    parent_account_id: clientData.parentAccountId,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(clientToProjectQuery, {
    replacements: client,
    transaction
  })

  return res
}

async function createEmployeeToProject ({
  employee,
  projectId,
  transaction,
  sequelize
}) {
  const employeeToProjectQuery = `
    INSERT INTO employee_to_project (id, revision_hash, employee_id, project_id, created_at, updated_at)
    VALUES (DEFAULT, :transaction_id, :employee_id, :project_id, now(), now())`

  const employeeQuery = {
    project_id: projectId,
    employee_id: employee[0].employee.userId,
    transaction_id: transaction.id
  }

  const res = await sequelize.query(employeeToProjectQuery, {
    replacements: employeeQuery,
    transaction
  })

  return res
}

async function createSegment ({
  projectId,
  employee,
  segment,
  transaction,
  sequelize
}) {
  const segmentQuery = `
    INSERT INTO segment (id, project_id, number_of_expert, name, complete, ordering, expert_brief, created_at, updated_at, updated_by)
    VALUES (DEFAULT, :project_id, :number_of_expert, :name, 0, 0, :expert_brief, now(), now(), :employee_id)`

  const segmentData = {
    project_id: projectId,
    employee_id: employee[0].employee.userId,
    number_of_expert: 5,
    name: `Database seeding ${segment}`,
    expert_brief:
      'We are working on a project for a client who is looking at Seeding Databases. In connection with this, our client is trying to gain a better understanding of database seeds.'
  }

  const res = await sequelize.query(segmentQuery, {
    replacements: segmentData,
    transaction
  })

  return res
}

async function updateSegmentScreeningQuestionId ({
  segmentId,
  segmentScreeningQuestionId,
  transaction,
  sequelize
}) {
  const segmentQuery = `
    Update segment set screening_questions_order=:segment_screening_question_id where id=:segment_id`

  const segment = {
    segment_id: segmentId,
    segment_screening_question_id: segmentScreeningQuestionId
  }

  const res = await sequelize.query(segmentQuery, {
    replacements: segment,
    transaction
  })

  return res
}

async function createSegmentScreeningQuestion ({
  segmentId,
  employee,
  transaction,
  sequelize
}) {
  const segmentScreeningQuery = `
    INSERT INTO segment_screening_question (id, segment_id, question, created_at, updated_at, updated_by)
    VALUES (DEFAULT, :segment_id, :question, now(), now(), :employee_id)`

  const segmentScreeningQuestion = {
    employee_id: employee[0].employee.userId,
    segment_id: segmentId,
    question:
      '<p>Please let us know about your relevant experience given the project brief above.</p>'
  }

  const res = await sequelize.query(segmentScreeningQuery, {
    replacements: segmentScreeningQuestion,
    transaction
  })

  return res
}

async function createBookmark ({
  projectId,
  employee,
  transaction,
  sequelize
}) {
  const bookmarkQuery = `
    INSERT INTO bookmark (id, employee_id, project_id, created_at, updated_at, updated_by)
    VALUES (DEFAULT, :employee_id, :project_id, now(), now(), :employee_id)`

  const bookmark = {
    project_id: projectId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(bookmarkQuery, {
    replacements: bookmark,
    transaction
  })

  return res
}

async function createEmployeeToSegment ({
  segmentId,
  employeeIdToSegment,
  transaction,
  sequelize
}) {
  const employeeToSegmentQuery = `
    INSERT INTO employee_to_segment (id, employee_id, segment_id, created_at, updated_at)
    VALUES (DEFAULT, :employee_id, :segment_id, now(), now())`

  const employeeToSegment = {
    segment_id: segmentId,
    employee_id: employeeIdToSegment
  }

  const res = await sequelize.query(employeeToSegmentQuery, {
    replacements: employeeToSegment,
    transaction
  })

  return res
}

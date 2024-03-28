const moment = require('moment')

module.exports = async function createEPLs (params) {
  const eplIds = []
  for (let i = 0; i < params.projects.length; i++) {
    let project = params.projects[i]
    for (let j = 0; j < params.experts.length; j++) {
      let expert = params.experts[j]
      let eplResult = await createEPL(project, expert, params)
      params.eplId = eplResult[0].insertId

      await createEPLExperienceSettings(expert, params)
      await createEmployeeToEPL(params)

      eplIds.push({
        epl: {
          eplId: params.eplId,
          projectId: project.project.projectId,
          expertUserId: expert.expert.expertUserId
        }
      })
    }
  }
  // eslint-disable-next-line no-console
  console.log(eplIds)
  return eplIds
}

async function createEPL (
  project,
  expert,
  { employee, generateInterviewedEPL = false, transaction, sequelize }
) {
  const eplQuery = `
      INSERT INTO expert_project_link (id, expert_id, is_expert_invited, cv_id, project_id, epl_status_id, atheneum_office_id, segment_id, industry_expertise, honorarium, honorarium_currency_id, fee, fee_currency_id,
        units_used, pricing_id, show_recordings, date_submitted, submitted_timestamp, date_delivered, date_interviewed, interview_duration, lock_interview_duration, submitted_by, interviewed_by, hidden_from_client, reply_status_id, pipeline_reference, free, employee_updated_by_id, updated_by, hash, created_at, updated_at)
      VALUES (DEFAULT, :expert_id, :is_expert_invited, :cv_id, :project_id, :epl_status_id, 1, :segment_id, :industry_expertise, 100000000, 1, 300000000, 1, 1000000, 1, false, :date_submitted, :submitted_timestamp, :date_delivered, :date_interviewed, :interview_duration, :lock_interview_duration, :submitted_by, :interviewed_by, :hidden_from_client, :reply_status_id, 1, 0, :employee_id, :employee_id, :hash, now(), now())`

  const epl = {
    expert_id: expert.expert.expertUserId,
    cv_id: expert.expert.cvId,
    project_id: project.project.projectId,
    employee_id: employee[0].employee.userId,
    epl_status_id: 1,
    submitted_by: null,
    interviewed_by: null,
    interview_duration: 60,
    lock_interview_duration: null,
    date_delivered: null,
    is_expert_invited: 0,
    date_interviewed: null,
    date_submitted: null,
    submitted_timestamp: null,
    hidden_from_client: 0,
    reply_status_id: 6,
    segment_id: project.project.segments[0].segmentId,
    industry_expertise: '<p>SQL Developer</p>',
    hash: transaction.id
  }

  if (generateInterviewedEPL) {
    epl.epl_status_id = 10
    epl.submitted_by = employee[0].employee.userId
    epl.interviewed_by = employee[0].employee.userId
    epl.interview_duration = 60
    epl.lock_interview_duration = 0
    epl.date_delivered = moment().format('YYYY-MM-00')
    epl.is_expert_invited = 1
    epl.date_interviewed = moment().format('YYYY-MM-00')
    epl.date_submitted = moment().format('YYYY-MM-00')
    epl.submitted_timestamp = moment().format('YYYY-MM-DD hh:mm:ss')
    epl.hidden_from_client = 1
    epl.reply_status_id = 5
  }

  const res = await sequelize.query(eplQuery, {
    replacements: epl,
    transaction
  })

  return res
}

async function createEPLExperienceSettings (
  expert,
  { eplId, employee, transaction, sequelize }
) {
  const eplExperienceSettingsQuery = `
      INSERT INTO epl_experience_settings (id, epl_id, experience_id, experience_visibility_type_id, updated_by, created_at, updated_at)
      VALUES (DEFAULT, :epl_id, :experience_id, 1, :employee_id, now(), now())`

  const eplExperience = {
    epl_id: eplId,
    employee_id: employee[0].employee.userId,
    experience_id: expert.expert.experienceId
  }

  const res = await sequelize.query(eplExperienceSettingsQuery, {
    replacements: eplExperience,
    transaction
  })

  return res
}

async function createEmployeeToEPL ({
  eplId,
  employee,
  transaction,
  sequelize
}) {
  const employeeToEplQuery = `
      INSERT INTO employee_to_epl (id, expert_project_link_id, employee_id, created_at, updated_at)
      VALUES (DEFAULT, :expert_project_link_id, :employee_id, now(), now())`

  const employeeToEpl = {
    expert_project_link_id: eplId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(employeeToEplQuery, {
    replacements: employeeToEpl,
    transaction
  })

  return res
}

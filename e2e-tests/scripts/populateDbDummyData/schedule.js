const moment = require('moment')

module.exports = async function createSchedules (params) {
  for (let i = 0; i < params.epls.length; i++) {
    params.epl = params.epls[i].epl
    await createClientAvailability(params)
    await createExpertToEPLAvailability(params)
    await createSchedule(params)
  }
}

async function createClientAvailability ({
  epl,
  employee,
  transaction,
  sequelize
}) {
  const clientAvailabilityQuery = `
      INSERT INTO client_to_project_availability (id, project_id, start_time, end_time, updated_by, created_at, updated_at)
      VALUES (DEFAULT, :project_id, :start_time, :end_time, :employee_id, now(), now()), 
      (DEFAULT, :project_id, :start_time_1, :end_time_1, :employee_id, now(), now()),
      (DEFAULT, :project_id, :start_time_2, :end_time_2, :employee_id, now(), now()),
      (DEFAULT, :project_id, :start_time_3, :end_time_3, :employee_id, now(), now())`

  const client = {
    start_time: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:00:00'),
    end_time: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:15:00'),
    start_time_1: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:15:00'),
    end_time_1: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:30:00'),
    start_time_2: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:30:00'),
    end_time_2: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:45:00'),
    start_time_3: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:45:00'),
    end_time_3: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 12:00:00'),
    project_id: epl.projectId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(clientAvailabilityQuery, {
    replacements: client,
    transaction
  })

  return res
}

async function createExpertToEPLAvailability ({
  epl,
  employee,
  transaction,
  sequelize
}) {
  const expertAvailabilityQuery = `
      INSERT INTO expert_availability_to_epl (id, expert_project_link_id, start_time, end_time, updated_by, created_at, updated_at)
      VALUES (DEFAULT, :expert_project_link_id, :start_time, :end_time, :employee_id, now(), now()), 
      (DEFAULT, :expert_project_link_id, :start_time_1, :end_time_1, :employee_id, now(), now()),
      (DEFAULT, :expert_project_link_id, :start_time_2, :end_time_2, :employee_id, now(), now()),
      (DEFAULT, :expert_project_link_id, :start_time_3, :end_time_3, :employee_id, now(), now())`

  const expert = {
    start_time: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:00:00'),
    end_time: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:15:00'),
    start_time_1: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:15:00'),
    end_time_1: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:30:00'),
    start_time_2: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:30:00'),
    end_time_2: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:45:00'),
    start_time_3: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:45:00'),
    end_time_3: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 12:00:00'),
    expert_project_link_id: epl.eplId,
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(expertAvailabilityQuery, {
    replacements: expert,
    transaction
  })

  return res
}

async function createSchedule ({ employee, transaction, sequelize }) {
  const scheduleQuery = `
      INSERT INTO schedule (id, start_time, end_time, duration, zoom_meeting_id, zoom_host_id, zoom_join_url, zoom_meeting_created_by, outlook_expert_event_id, outlook_expert_event_organizer_id, outlook_client_event_id, outlook_client_event_organizer_id, expert_invitation_sent_date, client_invitation_sent_date, outlook_expert_event_created_by, outlook_client_event_created_by, created_by, updated_by, created_at, updated_at, canceled)
      VALUES (DEFAULT, :start_time, :end_time, 60, :zoom_meeting_id, :zoom_host_id, :zoom_join_url, :employee_id, :outlook_event_id, :outlook_event_organizer_id, :outlook_event_id, :outlook_event_organizer_id, :expert_invitation_sent_date, :client_invitation_sent_date, :employee_id, :employee_id, :employee_id, :employee_id, now(), now(), 0)`

  const schedule = {
    start_time: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:00:00'),
    end_time: moment()
      .add(1, 'days')
      .format('YYYY-MM-DD 11:15:00'),
    zoom_meeting_id: 93138584196,
    zoom_host_id: 'lIpIlaNjTlC6MzZoWilhOw',
    zoom_join_url:
      'https://zoom.us/j/93138584196?pwd=ZmRqK1FaODcybVUxdExRVzU2QTNSZz09',
    outlook_event_id:
      'AAMkADEyOGI1NDVhLTJlNmItNGQ3OC05MmFjLTQ0OTA0YmVmYTBkYQBGAAAAAADVI1rhwWiASqeEJX7ksp7wBwDAvxx8_vYgSrsz4Urwk_b4AAAAAAENAADAvxx8_vYgSrsz4Urwk_b4AAB-5C38AAA=',
    outlook_event_organizer_id: 'b8cf645a-b4c3-408e-a509-c704147f7c2d',
    expert_invitation_sent_date: moment().format('YYYY-MM-DD hh:mm:ss'),
    client_invitation_sent_date: moment().format('YYYY-MM-DD hh:mm:ss'),
    employee_id: employee[0].employee.userId
  }

  const res = await sequelize.query(scheduleQuery, {
    replacements: schedule,
    transaction
  })

  return res
}

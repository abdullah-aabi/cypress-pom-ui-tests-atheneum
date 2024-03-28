const faker = require('faker')
const moment = require('moment')
const { updateEmployeePosition } = require('./employee')

module.exports = async function createTeams (params) {
  const teamsObject = []

  for (let i = 0; i < params.recordCount; i++) {
    params.teamName = params.teamObject
      ? params.teamObject.name
      : `Team ${faker.name.firstName()}`

    const createdTeam = await createTeam(params)

    await updateEmployeePosition({
      employeeId: params.associateUserId,
      updateData: [
        {
          column: 'team_id',
          value: createdTeam[0].insertId
        },
        {
          column: 'supervisor_id',
          value: params.teamLeaderUserId
        }
      ],
      sequelize: params.sequelize,
      transaction: params.transaction
    })

    await updateEmployeePosition({
      employeeId: params.teamLeaderUserId,
      updateData: [
        {
          column: 'team_id',
          value: createdTeam[0].insertId
        },
        {
          column: 'supervisor_id',
          value: params.accountManagerUserId
        }
      ],
      sequelize: params.sequelize,
      transaction: params.transaction
    })

    await updateEmployeePosition({
      employeeId: params.accountManagerUserId,
      updateData: [
        {
          column: 'team_id',
          value: createdTeam[0].insertId
        }
      ],
      sequelize: params.sequelize,
      transaction: params.transaction
    })

    teamsObject.push({
      team: {
        teamId: createdTeam[0].insertId,
        teamName: params.teamName,
        accountManagerId: params.accountManagerUserId,
        associateId: params.associateUserId,
        teamleaderId: params.teamLeaderUserId
      }
    })
  }
  // eslint-disable-next-line no-console
  console.log(teamsObject)
  return teamsObject
}

async function createTeam ({ teamName, transaction, sequelize }) {
  const teamQuery = `
    insert into team(
        id, name, created_at, updated_at, atheneum_office_id, active_from, is_expert_backed_research, outlook_team_user_id)
      values (DEFAULT, :team_name, now(), now(), 1, '${moment().format(
        'YYYY-MM-00'
      )}', 0, '1a1a1b1c-1a1d-1a1f-8a1d-1c1c1b1e1e1a')`

  const team = {
    team_name: teamName
  }

  const res = await sequelize.query(teamQuery, {
    replacements: team,
    transaction
  })

  return res
}

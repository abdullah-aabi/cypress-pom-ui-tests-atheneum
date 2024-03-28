#!/usr/bin/env node
/* eslint-disable no-console */

require('dotenv').config()
const sequelize = require('../../lib/db')
const { createEmployees } = require('./populateDbDummyData/employee')
const createClients = require('./populateDbDummyData/client')
const createExperts = require('./populateDbDummyData/expert')
const createTeams = require('./populateDbDummyData/team')
const createProjects = require('./populateDbDummyData/project')
const createEPLs = require('./populateDbDummyData/epl')
const createSchedules = require('./populateDbDummyData/schedule')
const createFees = require('./populateDbDummyData/cost')
const yargs = require('yargs')

const options = yargs
  .usage(
    'Usage: $0 --dev_admin [string] --employeecount [number] --expertcount [number] --projects_count [number]'
  )
  .example(
    '$0 --projects_epls_with_fees 6 --clients_count 6 --projects_count 6 --employees_count',
    'Inserts 6 clients, 6 employees, 6 projects with 6 segments and 6 epls each and all the necessary datas.'
  )
  .option('dev_admin', {
    describe: 'Insert the user in the legacy-platform database. Provide email address for the user. Default password: 4Z7@#zoKZxHNRSZwgh',
    type: 'string',
    demandOption: false,
    nargs: 1
  })
  .option('employees', {
    describe: 'Generate employees and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('experts', {
    describe: 'Generate experts and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('clients', {
    describe: 'Generate clients and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('teams', {
    describe: 'Generate teams with employees and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('projects', {
    describe: 'Generate projects and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('projects_with_epls', {
    describe: 'Generate epls and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('projects_epls_with_fees', {
    describe: 'Generate epls with fees and insert in the database.',
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('employee_role', {
    describe: 'Specify employee role.',
    default: 'Account Manager',
    type: 'string',
    demandOption: false,
    nargs: 1
  })
  .option('employees_count', {
    describe: 'Number of employees to be added on a project segment.',
    default: 1,
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('clients_count', {
    describe: 'Number of clients to create projects for.',
    default: 1,
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .option('projects_count', {
    describe: 'Number of projects to create epls for.',
    default: 1,
    type: 'number',
    demandOption: false,
    nargs: 1
  })
  .implies('dev_admin', '')
  .implies('employees', 'employee_role')
  .implies('projects', 'clients_count')
  .implies('projects', 'employees_count')
  .implies('projects_with_epls', 'projects_count')
  .implies('projects_with_epls', 'clients_count')
  .implies('projects_with_epls', 'employees_count')
  .implies('projects_epls_with_fees', 'projects_count')
  .implies('projects_epls_with_fees', 'clients_count')
  .implies('projects_epls_with_fees', 'employees_count').argv

void (async function main () {
  const transaction = await sequelize.transaction()

  try {
    let createdEmployees,
      createdExperts,
      createdClients,
      createdProjects,
      createdEPLs

    switch (true) {
      case options.hasOwnProperty('dev_admin'):
        await createEmployees({
          usersObject: {
            "emailAddress": options.dev_admin,
            "firstName": options.dev_admin.split('.')[0],
            "lastName": options.dev_admin.split('@')[0].split('.').pop()
          },
          employeeRole: "Admin",
          recordCount: 1,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('employees'):
        await createEmployees({
          employeeRole: options.employee_role,
          recordCount: options.employees,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('clients'):
        await createClients({
          recordCount: options.clients,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('experts'):
        await createExperts({
          recordCount: options.experts,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('teams'):
        const accountManagerUserId = await createEmployees({
          employeeRole: 'Account Manager',
          recordCount: 1,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        const associateUserId = await createEmployees({
          employeeRole: 'Associate',
          recordCount: 1,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        const teamLeaderUserId = await createEmployees({
          employeeRole: 'Team Leader',
          recordCount: 1,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })

        await createTeams({
          accountManagerUserId: accountManagerUserId[0].employee.userId,
          associateUserId: associateUserId[0].employee.userId,
          teamLeaderUserId: teamLeaderUserId[0].employee.userId,
          recordCount: options.teams,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('projects'):
        createdClients = await createClients({
          recordCount: options.clients_count,
          sequelize: sequelize,
          transaction
        })
        createdEmployees = await createEmployees({
          employeeRole: 'Account Manager',
          recordCount: options.employees_count,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        await createProjects({
          clients: createdClients,
          employee: createdEmployees,
          segmentsCount: options.employees_count,
          recordCount: options.projects,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('projects_with_epls'):
        createdClients = await createClients({
          recordCount: options.clients_count,
          sequelize: sequelize,
          transaction
        })
        createdEmployees = await createEmployees({
          employeeRole: 'Account Manager',
          recordCount: options.employees_count,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        createdExperts = await createExperts({
          recordCount: options.projects_with_epls,
          sequelize: sequelize,
          transaction
        })
        createdProjects = await createProjects({
          clients: createdClients,
          employee: createdEmployees,
          segmentsCount: options.employees_count,
          recordCount: options.projects_count,
          sequelize: sequelize,
          transaction
        })
        await createEPLs({
          clients: createdClients,
          employee: createdEmployees,
          projects: createdProjects,
          experts: createdExperts,
          sequelize: sequelize,
          transaction
        })
        break

      case options.hasOwnProperty('projects_epls_with_fees'):
        createdClients = await createClients({
          recordCount: options.clients_count,
          sequelize: sequelize,
          transaction
        })
        createdEmployees = await createEmployees({
          employeeRole: 'Account Manager',
          recordCount: options.employees_count,
          zoomUserId: null,
          sequelize: sequelize,
          transaction
        })
        createdExperts = await createExperts({
          recordCount: options.projects_epls_with_fees,
          sequelize: sequelize,
          transaction
        })
        createdProjects = await createProjects({
          clients: createdClients,
          employee: createdEmployees,
          segmentsCount: options.employees_count,
          recordCount: options.projects_count,
          sequelize: sequelize,
          transaction
        })
        createdEPLs = await createEPLs({
          clients: createdClients,
          employee: createdEmployees,
          projects: createdProjects,
          experts: createdExperts,
          generateInterviewedEPL: true,
          sequelize: sequelize,
          transaction
        })
        await createSchedules({
          employee: createdEmployees,
          epls: createdEPLs,
          sequelize: sequelize,
          transaction
        })
        await createFees({
          employee: createdEmployees,
          epls: createdEPLs,
          sequelize: sequelize,
          transaction
        })
        break

      default:
        console.log(
          'Invalid parameter supplied! Expected employees, clients, experts, teams, projects, projects_with_epls, projects_epls_with_fees!'
        )
        break
    }

    await transaction.commit()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    await transaction.rollback()
  }
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

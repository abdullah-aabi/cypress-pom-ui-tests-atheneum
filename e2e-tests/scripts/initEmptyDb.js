require('dotenv').config()
const sequelize = require('../../lib/db')
const { createEmployees } = require('./populateDbDummyData/employee')
const createTeams = require('./populateDbDummyData/team')
const createClients = require('./populateDbDummyData/client')
const createExperts = require('./populateDbDummyData/expert')

const usersList = require('./populateDbDummyData/test_users.json')
const { Sequelize } = require('../../lib/db')

void (async function main () {
  const transaction = await sequelize.transaction()
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0', { transaction })
    await sequelize.query('ALTER TABLE `client` AUTO_INCREMENT = 1000;', { transaction })
    await sequelize.query('ALTER TABLE `user` AUTO_INCREMENT = 1000;', { transaction })
    await sequelize.query('ALTER TABLE parent_account AUTO_INCREMENT = 1000;', { transaction })
    await sequelize.query('ALTER TABLE account AUTO_INCREMENT = 1000;', { transaction })
    await sequelize.query('ALTER TABLE office AUTO_INCREMENT = 1000;', { transaction })
    const employees = []
    let accountManagerUserId,
      associateUserId,
      teamLeaderUserId,
      dashboardAccountManagerUserId,
      dashboardAssociateUserId,
      dashboardTeamLeaderUserId

    for (let i = 0; i < usersList.length; i++) {
      const createdEmployees = await createEmployees({
        usersObject: usersList[i],
        employeeRole: usersList[i].position,
        recordCount: 1,
        zoomUserId: null,
        sequelize: sequelize,
        transaction
      })

      if (usersList[i].emailAddress.includes('test.ops.accountmanager')) {
        accountManagerUserId = createdEmployees[0].employee.userId
      }
      if (usersList[i].emailAddress.includes('test.ops.associate')) {
        associateUserId = createdEmployees[0].employee.userId
      }
      if (usersList[i].emailAddress.includes('test.ops.teamlead')) {
        teamLeaderUserId = createdEmployees[0].employee.userId
      }
      if (usersList[i].emailAddress.includes('test.dashboard.accountmanager')) {
        dashboardAccountManagerUserId = createdEmployees[0].employee.userId
      }
      if (usersList[i].emailAddress.includes('test.dashboard.associate')) {
        dashboardAssociateUserId = createdEmployees[0].employee.userId
      }
      if (usersList[i].emailAddress.includes('test.dashboard.teamlead')) {
        dashboardTeamLeaderUserId = createdEmployees[0].employee.userId
      }

      const employee = { ...usersList[i], ...createdEmployees[0].employee }
      employees.push(employee)
    }

    await createTeams({
      accountManagerUserId,
      associateUserId,
      teamLeaderUserId,
      teamObject: { name: 'QA Kanban' },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createTeams({
      accountManagerUserId: dashboardAccountManagerUserId,
      associateUserId: dashboardAssociateUserId,
      teamLeaderUserId: dashboardTeamLeaderUserId,
      teamObject: { name: 'QA Rocket' },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'QA Aven Milk Company',
        clientFirstName: 'Darren',
        clientLastName: 'Smith',
        atheneumContactId: accountManagerUserId,
        accountType: "Hedge Fund"
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'QA AMR International',
        clientFirstName: 'Frank',
        clientLastName: 'Connor',
        atheneumContactId: dashboardAccountManagerUserId
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'QA BASF Materials',
        clientFirstName: 'Brandon',
        clientLastName: 'Marlin',
        atheneumContactId: accountManagerUserId
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'KPMG',
        clientFirstName: 'John',
        clientLastName: 'Wick',
        atheneumContactId: accountManagerUserId,
        externalComplianceRequired: true,
        complianceType: 'KnowledgeManager',
        accountType: "Consultancy Firm"
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'Bain',
        clientFirstName: 'Bruce',
        clientLastName: 'Bain',
        atheneumContactId: accountManagerUserId,
        externalComplianceRequired: true,
        complianceType: 'CID',
        accountType: "Consultancy Firm"
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'Ernst & Young',
        clientFirstName: 'Mark',
        clientLastName: 'Young',
        atheneumContactId: accountManagerUserId,
        externalComplianceRequired: true,
        complianceType: 'EY',
        accountType: "Consultancy Firm"
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'QA ZS Associates',
        clientFirstName: 'Simon',
        clientLastName: 'Zeus',
        atheneumContactId: accountManagerUserId,
        accountType: "Hedge Fund"
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    await createClients({
      clientObject: {
        accountName: 'McKinsey & Company',
        clientFirstName: 'John',
        clientLastName: 'McKinsey',
        atheneumContactId: accountManagerUserId,
        externalComplianceRequired: false,
        accountType: "Consultancy Firm"
      },
      recordCount: 1,
      sequelize: sequelize,
      transaction
    })

    for (let i = 0; i < 25; i++) {
      await createExperts({
        expertObject: { firstName: 'Sherlock', lastName: `NotBlocked.${i}` },
        expertStatus: 'Warm Prospect',
        recordCount: 1,
        sequelize: sequelize,
        transaction
      })
    }

    for (let i = 0; i < 25; i++) {
      await createExperts({
        expertObject: { firstName: 'Sherlock', lastName: `Blocked.${i}` },
        expertStatus: 'Dormant Prospect',
        recordCount: 1,
        sherlockBlocked: true,
        sequelize: sequelize,
        transaction
      })
    }

    await createExperts({
      expertObject: { firstName: 'Haraldt', lastName: 'Herholzt' },
      recordCount: 1,
      sequelize: sequelize,
      expertStatus: 'Active Expert',
      complianceSigned: true,
      confirmedPaymentDetails: true,
      transaction
    })

    await createExperts({
      expertObject: { firstName: 'Marc', lastName: 'Julien' },
      recordCount: 1,
      sequelize: sequelize,
      expertStatus: 'Active Expert',
      complianceSigned: true,
      confirmedPaymentDetails: true,
      transaction
    })

    await createExperts({
      expertObject: { firstName: 'Sherlock', lastName: 'Holmes' },
      recordCount: 1,
      expertStatus: 'Active Expert',
      sequelize: sequelize,
      complianceSigned: true,
      confirmedPaymentDetails: true,
      transaction
    })

    await transaction.commit()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    await transaction.rollback()
  }
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

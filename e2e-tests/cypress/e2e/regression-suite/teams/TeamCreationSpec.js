/// <reference types="Cypress" />
import generator from '../../../support/generator'
import TeamsPage from '../../../pageObjects/TeamsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'

describe('Creating Team by Admin', { tags: ["regression", "smoke"] }, function () {
  let teamDetails
  let accountManagerData = []
  let associateData = []
  let teamLeadData = []
  let principalData = []
  let authBody, accountManagerId, associateId, teamLeadId, principalId

  const teamsPage = new TeamsPage()
  const globalPage = new GlobalPage()

  const teamName = `Team-${generator.generateFirstName()}`
  const firstNameAccountManager = generator.generateFirstName()
  const lastNameAccountManager = generator.generateLastName()
  const originalNameAccountManager = `${firstNameAccountManager} ${lastNameAccountManager}`
  const firstNameAssociate = generator.generateFirstName()
  const lastNameAssociate = generator.generateLastName()
  const originalNameAssociate = `${firstNameAssociate} ${lastNameAssociate}`
  const firstNameTeamLead = generator.generateFirstName()
  const lastNameTeamLead = generator.generateLastName()
  const originalTeamLead = `${firstNameTeamLead} ${lastNameTeamLead}`
  const firstNamePrincipal = generator.generateFirstName()
  const lastNamePrincipal = generator.generateLastName()
  const originalNamePrincipal = `${firstNamePrincipal} ${lastNamePrincipal}`

  accountManagerData.push({
    firstNameAccountManager: firstNameAccountManager,
    lastNameAccountManager: lastNameAccountManager,
    emailAccountManager: `${firstNameAccountManager +
      lastNameAccountManager}@mail.com`
  })

  associateData.push({
    firstNameAssociate: firstNameAssociate,
    lastNameAssociate: lastNameAssociate,
    emailAssociate: `${firstNameAssociate + lastNameAssociate}@mail.com`
  })

  teamLeadData.push({
    firstNameTeamLead: firstNameTeamLead,
    lastNameTeamLead: lastNameTeamLead,
    emailTeamLead: `${firstNameTeamLead + lastNameTeamLead}@mail.com`
  })

  principalData.push({
    firstNamePrincipal: firstNamePrincipal,
    lastNamePrincipal: lastNamePrincipal,
    emailPrincipal: `${firstNamePrincipal + lastNamePrincipal}@mail.com`
  })

  function createEmployeeAccountManager() {
    cy.wrap(accountManagerData).each(accountManager => {
      cy.fixture('objects/accountManagerCreateObject').then(
        accountManagerCreateObject => {
          accountManagerCreateObject.firstName =
            accountManager.firstNameAccountManager
          accountManagerCreateObject.lastName =
            accountManager.lastNameAccountManager
          accountManagerCreateObject.email = accountManager.emailAccountManager
          cy.requestSearchEmployeeByName(
            authBody.token,
            accountManagerCreateObject.email
          ).then(employeeResponse => {
            if (employeeResponse.body.rows.length === 0) {
              cy.requestCreateEmployee(
                authBody.token,
                accountManagerCreateObject
              ).then(createdemployeeResponse => {
                accountManagerId = `${createdemployeeResponse.body.id}`
                cy.log(
                  `New Account Manager created: id = ${createdemployeeResponse.body.id
                  }`
                )
              })
            } else {
              cy.log(
                `Account manager already exists: id = ${employeeResponse.body.rows[0].id
                }`
              )
              accountManagerId = `${employeeResponse.body.rows[0].id}`
            }
          })
        }
      )
    })
  }

  function createEmployeeAssociate() {
    cy.wrap(associateData).each(associate => {
      cy.fixture('objects/associateCreateObject').then(
        associateCreateObject => {
          associateCreateObject.firstName = associate.firstNameAssociate
          associateCreateObject.lastName = associate.lastNameAssociate
          associateCreateObject.email = associate.emailAssociate
          cy.requestSearchEmployeeByName(
            authBody.token,
            associateCreateObject.email
          ).then(employeeResponse => {
            if (employeeResponse.body.rows.length === 0) {
              cy.requestCreateEmployee(authBody.token, associateCreateObject).then(
                createdemployeeResponse => {
                  associateId = `${createdemployeeResponse.body.id}`
                  cy.log(
                    `New Associate created: id = ${createdemployeeResponse.body.id
                    }`
                  )
                }
              )
            } else {
              cy.log(
                `Employee already exists: id = ${employeeResponse.body.rows[0].id
                }`
              )
              associateId = `${employeeResponse.body.rows[0].id}`
            }
          })
        }
      )
    })
  }

  function createEmployeeTeamLead() {
    cy.wrap(teamLeadData).each(teamLead => {
      cy.fixture('objects/teamLeadCreateObject').then(teamLeadCreateObject => {
        teamLeadCreateObject.firstName = teamLead.firstNameTeamLead
        teamLeadCreateObject.lastName = teamLead.lastNameTeamLead
        teamLeadCreateObject.email = teamLead.emailTeamLead
        cy.requestSearchEmployeeByName(
          authBody.token,
          teamLeadCreateObject.email
        ).then(employeeResponse => {
          if (employeeResponse.body.rows.length === 0) {
            cy.requestCreateEmployee(authBody.token, teamLeadCreateObject).then(
              createdemployeeResponse => {
                teamLeadId = `${createdemployeeResponse.body.id}`
                cy.log(
                  `New Team Lead created: id = ${createdemployeeResponse.body.id
                  }`
                )
              }
            )
          } else {
            cy.log(
              `Employee already exists: id = ${employeeResponse.body.rows[0].id
              }`
            )
            teamLeadId = `${employeeResponse.body.rows[0].id}`
          }
        })
      })
    })
  }

  function createEmployeePrincipal() {
    cy.wrap(principalData).each(principal => {
      cy.fixture('objects/principalCreateObject').then(
        principalCreateObject => {
          principalCreateObject.firstName = principal.firstNamePrincipal
          principalCreateObject.lastName = principal.lastNamePrincipal
          principalCreateObject.email = principal.emailPrincipal
          cy.requestSearchEmployeeByName(
            authBody.token,
            principalCreateObject.email
          ).then(employeeResponse => {
            if (employeeResponse.body.rows.length === 0) {
              cy.requestCreateEmployee(authBody.token, principalCreateObject).then(
                createdemployeeResponse => {
                  principalId = `${createdemployeeResponse.body.id}`
                  cy.log(
                    `New principal created: id = ${createdemployeeResponse.body.id
                    }`
                  )
                }
              )
            } else {
              cy.log(
                `Employee already exists: id = ${employeeResponse.body.rows[0].id
                }`
              )
              principalId = `${employeeResponse.body.rows[0].id}`
            }
          })
        }
      )
    })
  }

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
    cy.requestLogIn(
      Cypress.env('CYPRESS_ADMIN_USERNAME'),
      Cypress.env('CYPRESS_ADMIN_PASSWORD')
    ).then(loginResponse => {
      authBody = loginResponse.body

      createEmployeeAccountManager()
      createEmployeeAssociate()
      createEmployeeTeamLead()
      createEmployeePrincipal()
    })

    cy.fixture('teamDetails').then(teamdetails => {
      teamDetails = teamdetails
    })
  })

  beforeEach(function () {
    cy.intercept('GET', '**api/team/employees/**').as(
      'teamMembersRequest')

    cy.intercept('GET', '**api/employee/list-all').as(
      'employeeListAllRequest')

    cy.setLocalStorageLoginInfo(
      authBody.user,
      authBody.token
    )
    cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/admin/teams')

    cy.wait('@employeeListAllRequest')
      .its('response.statusCode').should('eq', 200)

    cy.wait('@teamMembersRequest')
      .its('response.statusCode').should('eq', 200)
  })

  it('Should create a team', function () {
    cy.wait(1000)
    teamsPage
      .getNewTeamButton()
      .click()

    teamsPage
      .getTeamNameField()
      .type(teamName)

    teamsPage.selectAtheneumOffice(teamDetails.atheneumOffice)

    teamsPage.selectAccountManager(originalNameAccountManager)

    teamsPage
      .getSubmitButton()
      .click()

    globalPage
      .getNotificationTitle()
      .contains(teamDetails.successMessage)

    teamsPage
      .getTeamName()
      .contains(teamName)

    teamsPage
      .getEmployeeFieldByID(teamName, accountManagerId)
      .contains(originalNameAccountManager)

    teamsPage
      .getEmployeePositionByID(teamName, accountManagerId)
      .contains(teamDetails.accountManagerPosition)
  })

  it('Should add associate to the team', function () {
    teamsPage.getTeamCardAction(teamName).contains('Add Associate').click()

    teamsPage.selectEmployeeByName(originalNameAssociate)

    teamsPage
      .getSubmitButton()
      .click()

    teamsPage
      .getTeamName()
      .contains(teamName)

    teamsPage
      .getEmployeeFieldByID(teamName, associateId)
      .contains(originalNameAssociate)

    teamsPage
      .getEmployeePositionByID(teamName, associateId)
      .contains(teamDetails.associatePosition)
  })

  it('Should add Team Lead to the team', function () {
    teamsPage.getTeamCardAction(teamName).contains('Add Team Leader').click()

    teamsPage.selectEmployeeByName(originalTeamLead)

    teamsPage
      .getSubmitButton()
      .click()

    teamsPage
      .getTeamName()
      .contains(teamName)

    teamsPage
      .getEmployeeFieldByID(teamName, teamLeadId)
      .contains(originalTeamLead)

    teamsPage
      .getEmployeePositionByID(teamName, teamLeadId)
      .contains(teamDetails.teamLeadPosition)
  })

  it('Should set Target for the team', function () {
    teamsPage
      .getTargetValueForEmployee(teamName, accountManagerId)
      .should('be.visible')
      .clear()
      .type(teamDetails.targetValue)

    teamsPage
      .getTargetValueForEmployee(teamName, teamLeadId)
      .should('be.visible')
      .clear()
      .type(teamDetails.targetValue)

    teamsPage
      .getTargetValueForEmployee(teamName, associateId)
      .should('be.visible')
      .clear()
      .type(teamDetails.targetValue)

    teamsPage
      .getTargetValueForEmployee(teamName, accountManagerId)
      .should('be.visible')
      .should('have.value', teamDetails.targetValue)

    teamsPage
      .getTargetValueForEmployee(teamName, teamLeadId)
      .should('be.visible')
      .should('have.value', teamDetails.targetValue)

    teamsPage
      .getTargetValueForEmployee(teamName, associateId)
      .should('be.visible')
      .should('have.value', teamDetails.targetValue)
  })

  it('Should Edit Team and add Principal', function () {
    teamsPage.getTeamCardAction(teamName).contains('Edit').click()
    teamsPage.selectRegionalPrincipal(originalNamePrincipal)

    teamsPage
      .getSubmitButton()
      .click()

    globalPage
      .getNotificationTitle()
      .contains(teamDetails.successMessage)

    teamsPage
      .getPrincipalNameByID(teamName, principalId)
      .contains(originalNamePrincipal)

    teamsPage.getPrincipalPosition(teamName).should('have.text', teamDetails.principalPosition)
  })

  it('Should delete the team', function () {
    teamsPage.getTeamCardAction(teamName).contains('Delete').click()

    teamsPage
      .getDeleteConfirmationButton()
      .click()

    teamsPage.getTeamName().should('not.contain', teamName)
  })
})

import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'

describe('EPL Status for Survey Reasearch Project', { tags: ["regression", "smoke"] }, function () {
  let projectDetails, testUsers, authToken, employeeFullName, expertDetails
  let expertNamesData = generator.generateExpertNames(2)
  let createdExperts = []

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const expertInvitePage = new ExpertInvitePage()
  const expertDetailsPage = new ExpertDetailsPage()
  const expertPipelinePage = new ExpertPipelinePage()
  const projectDetailsPage = new ProjectDetailsPage()
  const globalPage = new GlobalPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)

    cy.clearLocalAndSessionStorage()
    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers
      employeeFullName = `${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName
        }`

      cy.requestLogIn(
        testUsers.associate.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        authToken = loginResponse.body
      })

      cy.wrap(expertNamesData).each(expert => {
        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
          expertCreateObject.firstName = expert.firstName
          expertCreateObject.lastName = expert.lastName
          expertCreateObject.originalName = expert.originalName
          expertCreateObject.email = expert.email
          cy.requestCreateExpert(authToken.token, expertCreateObject).then(
            expertCreateResponse =>
              createdExperts.push({
                expertId: expertCreateResponse.body.id,
                fullName: expertCreateObject.originalName
              })
          )
        })
      })
    })

    cy.createProjectFromAPI(projectName, 'Expert Survey Research')

    cy.fixture('projectDetails').then(testData => {
      projectDetails = testData
    })

    cy.fixture('expertDetails').then(testData => {
      expertDetails = testData
    })
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/expert-invite-template`).as('updateLanguage')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
    cy.intercept('GET', '**/items?offset=0').as('waitToLoadList')
    cy.intercept('POST', '**/bulk-validate').as('waitForbulkValidate')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-invite-to-project`).as('bulkInviteToProjectRequest')
  })

  it('should verify expert is inteviewed by 1-Click invite', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[0].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.getExpertInviteButton().contains('1-Click Invite').click()
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)

    expertDetailsPage.getEplWarning().click()
    cy.waitForLoadingDisappear()
    expertInvitePage.getEPLStatusDropdown().should('have.text', 'Interviewed')

    expertInvitePage.getExpertCode().contains(`EX-${createdExperts[0].expertId}`).should('be.visible').click()
    cy.waitForLoadingDisappear()
    expertInvitePage.getDeliveredByText().should('contain.text', 'Test Associate')
  })

  it('should verify expert interviewed by adding as interested only', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[1].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.getExpertAddOnlyButton().contains('Add Only').trigger('mouseover')
    expertDetailsPage.getAddOnlyButtonList().contains('Interested').click({ force: true })
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)

    expertDetailsPage.getEplWarning().click()
    cy.waitForLoadingDisappear()
    expertInvitePage.getExpertCode().contains(`EX-${createdExperts[1].expertId}`).parentsUntil('div.single--green')
      .within(() => {
        expertInvitePage.getEPLStatusDropdown().should('have.text', 'Interviewed')
      })

    expertInvitePage.getExpertCode().contains(`EX-${createdExperts[1].expertId}`).should('be.visible').click()
    cy.waitForLoadingDisappear()
    expertInvitePage.getDeliveredByText().should('contain.text', 'Test Associate')
  })
})

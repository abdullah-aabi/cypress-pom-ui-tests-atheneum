import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'

describe('Add/Invite expert to project With various selection', { tags: ["regression", "smoke"] }, function () {
  let projectDetails, testUsers, authToken, employeeFullName, expertDetails, eplLink
  let expertNamesData = generator.generateExpertNames(1)
  let createdExperts = []

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const expertInvitePage = new ExpertInvitePage()
  const expertPipelinePage = new ExpertPipelinePage()
  const expertDetailsPage = new ExpertDetailsPage()
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
        testUsers.accountManager.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        authToken = loginResponse.body
        cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
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
                fullName: expertCreateObject.originalName,
                phoneNum: expertCreateObject.address.phones[0].phoneNum
              })

          )
        })
      })
    })
    cy.createProjectFromAPI(projectName, 'Expert Sessions')

    cy.fixture('projectDetails').then(testData => {
      projectDetails = testData
    })
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
    cy.intercept('GET', '**/items?offset=0').as('waitToLoadList')
    cy.intercept('POST', '**/bulk-validate').as('waitForbulkValidate')
    cy.fixture('expertDetails').then(testData => {
      expertDetails = testData

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
      expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
    })

  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/expert-invite-template`).as('updateLanguage')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/log-expert`).as('expertCall')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-invite-to-project`).as('bulkInviteToProjectRequest')
  })

  it('should add a new contact number to make a call from expert page', function () {

    expertDetailsPage.getEditButton().should('be.visible').click()
    expertDetailsPage.getScrollDownButton().click()
    expertDetailsPage.getAddPhoneNumberField('+92123344445')
    expertDetailsPage.getFormStatusChangeSubmit().click()

    expertDetailsPage.getCallButton().click()
    expertDetailsPage.getContactNumber().first().should('contain.text', `Call ${createdExperts[0].phoneNum}`)
    expertDetailsPage.getContactNumber().last().should('contain.text', 'Call +92123344445')

    // We need to verify call api here 
    //================================
    // cy.wait('@expertCall').its('response.statusCode').should('eq', 200)
  })

  it('should verify contact number to make a call from platform manager page', function () {
    expertDetailsPage.getHistory().click({ force: true })
    expertDetailsPage.getEplLink().then((href) => {
      cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}${href}`)
    })
    cy.waitForLoadingDisappear()
    expertDetailsPage.getCallButton().click()
    expertDetailsPage.getContactNumber().first().should('contain.text', `Call ${createdExperts[0].phoneNum}`)
    expertDetailsPage.getContactNumber().last().should('contain.text', 'Call +92123344445')

    // We need to verify call api here 
    //================================
    // cy.wait('@expertCall').its('response.statusCode').should('eq', 200)

  })

})

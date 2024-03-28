import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'

describe('Add comments of in project EPLs', { tags: "regression" }, function () {
  let authInfo, projectId

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const globalPage = new GlobalPage()
  const expertPipelinePage = new ExpertPipelinPage()

  const expertsData = generator.generateExpertNames(1)[0]

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id

        cy.fixture('testUsers').then(testUsers => {
          cy.requestLogIn(
            testUsers.associate.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(loginResponse => {
            authInfo = loginResponse
          })

          cy.requestLogIn(
            testUsers.associate.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(loginResponse => {
            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
              expertCreateObject.firstName = expertsData.firstName
              expertCreateObject.lastName = expertsData.lastName
              expertCreateObject.originalName = expertsData.originalName
              expertCreateObject.email = expertsData.email
              cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                expertCreateResponse =>
                  cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
              )
            })
          })
        })
      }
    )
  })

  beforeEach(function () {
    cy.intercept('POST', '/api/project/**/pipeline').as('waitForEPL')
    cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
    )
    cy.waitForLoadingDisappear()

    cy.wait('@waitForEPL').its('response.statusCode').should('eq', 200)

  })

  it('should add comment to the epl and verify from manager account', function () {

    // User is able to click on comment button
    globalPage.getCommentIcon().click();
    // adding comment to the field
    expertPipelinePage.getEPLCommentBox('Test comments are visible here.')
    globalPage.getButtonByName('Submit').click()
    // verifying comment status as associate
    expertPipelinePage.getEPLCommentTitle('Test Associate')
    expertPipelinePage.getEPLCommentStatus('wrote')
    expertPipelinePage.getEplCommentVerified(' Test comments are visible here. ')
    // getting comment's time & date
    let dateTime
    expertPipelinePage.getEPLCommentTime().invoke('text').then((text) => {
      cy.log(text)
      dateTime = text
    })

    cy.fixture('testUsers').then(testUsers => {

      // user is going to log in as Account Manager
      cy.requestLogIn(
        testUsers.accountManager.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        authInfo = loginResponse
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.visit(
          `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        cy.wait('@waitForEPL').its('response.statusCode').should('eq', 200)

        // user is verifiying here that comment is unread by aacount admin
        expertPipelinePage.getEPLUnreadCommentBox().click()
        expertPipelinePage.getEPLCommentTitle('Test Associate')
        expertPipelinePage.getEPLCommentStatus('wrote')
        expertPipelinePage.getEplCommentVerified(' Test comments are visible here. ')
        // Verifiying comment time here
        expertPipelinePage.getEPLCommentTime().should('have.text', dateTime)
      })

    })

  })

})

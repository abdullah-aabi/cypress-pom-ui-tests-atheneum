import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import BundleCreationPage from '../../../pageObjects/BundleCreationPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertMessagingPage from '../../../pageObjects/ExpertMessagingPage'
let eplData = require('../../../fixtures/hcpEPLData.json')

describe('Expert Messaging', { tags: ["regression", "smoke"] }, function () {
  let testUsers,
    authToken,
    localStorage,
    projectId, eplId

  let expertData = generator.generateExpertNames(1)[0]
  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const expertInvitePage = new ExpertInvitePage()
  const expertPipelinePage = new ExpertPipelinPage()
  const bundleCreationPage = new BundleCreationPage()
  const globalPage = new GlobalPage()
  const projectDetailsPage = new ProjectDetailsPage()
  const expertMessagingPage = new ExpertMessagingPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)

    cy.clearLocalAndSessionStorage()
    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers
    })
    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id

        cy.requestLogIn(
          testUsers.accountManager.emailAddress,
          Cypress.env('CYPRESS_USER_PASSWORD')
        ).then(quickLoginResponse => {
          authToken = quickLoginResponse.body.token
          cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            // creating an expert with api
            expertCreateObject.firstName = expertData.firstName
            expertCreateObject.lastName = expertData.lastName
            expertCreateObject.originalName = expertData.originalName
            expertCreateObject.email = expertData.email

            cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
              expertCreateResponse => {
                // sending invite to project 
                cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                  addAndInviteExpertToProjectFromAPIResponse => {
                    eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                  }
                )
              }
            )
          })
          localStorage = quickLoginResponse.body
          cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
          cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        })
      }
    )
  })
  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
  })

  it('Should verify expert messaging box is visible', function () {

    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
    cy.waitForLoadingDisappear()

    projectDetailsPage.getEditProjectSettingBtn().should('be.visible').click()
    cy.waitForLoadingDisappear()

    projectDetailsPage.getSettingsTitle().should('have.text', 'Edit settings')
    projectDetailsPage.getExpertAuthOption().click().should('have.value', 'true')

    globalPage.submitButton().should('be.enabled').click()
    cy.waitForLoadingDisappear()

    expertMessagingPage.getMessagingButton().click()
    cy.waitForLoadingDisappear()

    expertMessagingPage.getChatTab().should('have.text', 'Expert')
    expertMessagingPage.getChatBox().should('have.text', 'No messages')



  })


})
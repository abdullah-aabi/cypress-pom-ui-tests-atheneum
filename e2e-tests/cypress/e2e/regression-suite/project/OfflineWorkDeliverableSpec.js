import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectOutcomePage from '../../../pageObjects/ProjectOutcomePage'
import FeePage from '../../../pageObjects/FeePage'
import generator from '../../../support/generator'

import moment from 'moment'

describe('Team Leader adds expert cost and client charge', { tags: "regression" }, function () {
  let userFullName,
    authInfo,
    projectId,
    testData,
    marginValue,
    marginPercentage,
    authToken
  const projectName = `${generator.generateTestName()} Expert Sessions project`

  const globalPage = new GlobalPage()
  const projectOutcomePage = new ProjectOutcomePage()

  let expertData = generator.generateExpertNames(1)[0]

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.fixture('costsTestData').then(costTestData => {
      testData = costTestData

      marginValue = testData.feeValue - testData.costValue
      marginPercentage = Math.round((marginValue * 100) / testData.feeValue)
    })

    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id

        cy.fixture('testUsers').then(testUsers => {
          userFullName = `${testUsers.teamLeader.firstName} ${testUsers.teamLeader.lastName
            }`
          cy.requestLogIn(
            testUsers.teamLeader.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(loginResponse => {
            authInfo = loginResponse
            authToken = loginResponse.body.token
            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
              expertCreateObject.firstName = expertData.firstName
              expertCreateObject.lastName = expertData.lastName
              expertCreateObject.originalName = expertData.originalName
              expertCreateObject.email = expertData.email
              cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                expertCreateResponse => {
                  expertData.expertId = expertCreateResponse.body.id
                  cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
                }
              )
            })
          })
        })
      }
    )
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/outcome`
    )
    cy.waitForLoadingDisappear()
  })

  it('should add a new cost and check the created data with ES - Offline work/written assignments', function () {
    projectOutcomePage.getAddCostButton().click({ force: true })
    projectOutcomePage.selectDeliverableType('ES - Offline work/written assignments')
    projectOutcomePage.selectCostType(testData.costType)
    projectOutcomePage.selectExpert(expertData.originalName)
    projectOutcomePage.selectCurrentDate()
    projectOutcomePage.selectCostCurrencyType(testData.currencyType)
    projectOutcomePage.getCostValueInput().type(testData.costValue)
    projectOutcomePage.selectDeliveredBy(userFullName)
    projectOutcomePage.getSaveCostButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Saved')
    globalPage
      .getNotificationMessage()
      .should('contain.text', testData.successfulMessage)

    projectOutcomePage
      .getGrossMarginMetricsValue()
      .should('contain', `${testData.costValue}.00 €`)
    projectOutcomePage
      .getCostsMetricsValue()
      .should('contain', `${testData.costValue}.00 €`)
    cy.requestDeliverableApi(authToken, projectId, 'ES - Offline work/written assignments')
  })
})

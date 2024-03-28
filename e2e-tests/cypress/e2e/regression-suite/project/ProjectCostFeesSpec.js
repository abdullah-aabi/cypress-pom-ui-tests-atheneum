import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectOutcomePage from '../../../pageObjects/ProjectOutcomePage'
import FeePage from '../../../pageObjects/FeePage'
import generator from '../../../support/generator'

import moment from 'moment'

describe('Team Leader adds expert cost and client charge', { tags: ["regression", "smoke"] }, function () {
  let userFullName,
    authInfo,
    projectId,
    currencyRates,
    testData,
    marginValue,
    marginPercentage,
    authToken
  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const queryParameter = (moment().format('DD') === '01') ? moment().subtract(1, 'month').format('YYYY-MM') : moment().format('YYYY-MM')

  const globalPage = new GlobalPage()
  const projectOutcomePage = new ProjectOutcomePage()
  const feePage = new FeePage()

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

  it('should add a new cost and check the created data', function () {
    projectOutcomePage.getAddCostButton().click({ force: true })
    projectOutcomePage.selectDeliverableType(testData.deliverableType)
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

    projectOutcomePage
      .getDeliverableValue()
      .should('contain', testData.deliverableType)
    projectOutcomePage.getCostTypeValue().should('contain', testData.costType)
    projectOutcomePage.getExpertValue().should('contain', expertData.originalName)
  })

  it('should add a new client charge and check the margin value', function () {
    projectOutcomePage.getAddClientChargeButton().click({ force: true })
    projectOutcomePage.selectDeliverableType(testData.deliverableType)

    projectOutcomePage.selectFeeType(testData.feeType)
    projectOutcomePage.selectCurrentDate()
    projectOutcomePage.selectFeeCurrencyType(testData.currencyType)
    projectOutcomePage.getFeeValueInput().type(testData.feeValue)
    projectOutcomePage.selectDeliveredBy(userFullName)
    projectOutcomePage.getSaveCostButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Saved')
    globalPage
      .getNotificationMessage()
      .should('contain.text', testData.successfulMessage)

    projectOutcomePage
      .getGrossMarginMetricsValue()
      .should('contain', `${marginValue}.00 €`)
    projectOutcomePage
      .getGrossMarginMetricsPercentage()
      .should('contain', marginPercentage)
    projectOutcomePage
      .getFeesMetricsValue()
      .should('contain', `${testData.feeValue}.00 €`)
  })

  it('should edit the cost and check margin value and cost value are modified', function () {
    cy.requestGetCurrencyRates(
      authToken,
      queryParameter
    ).then(currencyResponse => {
      currencyRates =
        currencyResponse.body[currencyResponse.body.length - 1]

      const convertedInEURCost = parseFloat(
        testData.newCostValue / currencyRates.eurToUsd
      ).toFixed(2)

      projectOutcomePage
        .getCostDetailsPageLink()
        .contains(testData.costType)
        .click({ force: true })
      cy.waitForLoadingDisappear()

      feePage.getEditButton().click()

      projectOutcomePage.selectCostCurrencyType(testData.newCostCurrency)
      projectOutcomePage
        .getCostValueInput()
        .clear()
        .type(testData.newCostValue)
      projectOutcomePage.getSaveCostButton().click()

      globalPage.getNotificationTitle().should('have.text', 'Saved')
      globalPage
        .getNotificationMessage()
        .should('contain.text', testData.successfulMessage)

      feePage.getProjectOutcomeButton().click()

      projectOutcomePage
        .getGrossMarginMetricsValue()
        .should('contain', `${testData.feeValue - convertedInEURCost} €`)
      projectOutcomePage
        .getCostsMetricsValue()
        .should('contain', `${convertedInEURCost} €`)
    })
  })

  it('should delete the cost', function () {
    projectOutcomePage
      .getCostDetailsPageLink()
      .contains(testData.costType)
      .click({ force: true })
    cy.waitForLoadingDisappear()

    feePage.getDeleteButton().click()
    feePage.getConfirmDeleteButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .should('contain.text', testData.feeDeletedMessage)

    projectOutcomePage
      .getGrossMarginMetricsValue()
      .should('contain', `${testData.feeValue}.00 €`)
    projectOutcomePage.getCostsMetricsValue().should('contain', '0.00 €')
  })

  it('should add a new cost for existing deliverable', function () {
    projectOutcomePage.getAddCostButton().click({ force: true })
    projectOutcomePage.getExistingDeliverableRadio().click()
    projectOutcomePage.selectDeliverableType(testData.deliverableType)
    projectOutcomePage.selectCostType(testData.costType)
    projectOutcomePage.selectExpert(expertData.originalName)
    projectOutcomePage.selectCurrentDate()
    projectOutcomePage.selectCostCurrencyType(testData.currencyType)
    projectOutcomePage.getCostValueInput().type(testData.costValue)
    projectOutcomePage.getCostBillableToClientCheckbox().click()
    projectOutcomePage.selectDeliveredBy(userFullName)
    projectOutcomePage.getSaveCostButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Saved')
    globalPage
      .getNotificationMessage()
      .should('contain.text', testData.successfulMessage)

    projectOutcomePage
      .getGrossMarginMetricsValue()
      .should('contain', `${marginValue}.00 €`)
    projectOutcomePage
      .getGrossMarginMetricsPercentage()
      .should('contain', marginPercentage)
    projectOutcomePage
      .getCostsMetricsValue()
      .should('contain', `${testData.costValue}.00 €`)
  })

  it('should edit the client charge and check the currency conversion is correct', function () {
    const convertedInEURFee = parseFloat(
      testData.newFeeValue / currencyRates.eurToJpy
    ).toFixed(2)

    projectOutcomePage
      .getCostDetailsPageLink()
      .contains(testData.feeType)
      .click({ force: true })
    cy.waitForLoadingDisappear()

    feePage.getEditButton().click()

    projectOutcomePage
      .getFeeValueInput()
      .clear()
      .type(testData.newFeeValue)

    projectOutcomePage.selectCostCurrencyType(testData.newFeeCurrency)

    projectOutcomePage.getSaveCostButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Saved')
    globalPage
      .getNotificationMessage()
      .should('contain.text', testData.successfulMessage)

    feePage.getProjectOutcomeButton().click()

    projectOutcomePage
      .getGrossMarginMetricsValue()
      .should('contain', `${convertedInEURFee - testData.costValue} €`)

    projectOutcomePage
      .getFeesMetricsValue()
      .should('contain', `${convertedInEURFee} €`)
  })

  it('should delete the client charge', function () {
    projectOutcomePage
      .getCostDetailsPageLink()
      .contains(testData.feeType)
      .click({ force: true })
    cy.waitForLoadingDisappear()

    feePage.getDeleteButton().click()
    feePage.getConfirmDeleteButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .should('contain.text', testData.feeDeletedMessage)

    projectOutcomePage
      .getGrossMarginMetricsValue()
      .should('contain', `-${testData.costValue}.00 €`)
    projectOutcomePage.getFeesMetricsValue().should('contain', '0.00 €')
  })
})

import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import generator from '../../../support/generator'

describe('Multi Expert Meeting', { tags: "regression" }, function () {
  let testUsers, authToken, localStorage, projectId, eplId1, eplId2, projectDetails, dateForEpl1, dateForEpl2, timeForEpl1, timeForEpl2
  let createdExperts = []
  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const expertInvitePage = new ExpertInvitePage()
  const expertPipelinePage = new ExpertPipelinePage()
  const fasterSchedulingPage = new FasterSchedulingPage()

  let expertsData = generator.generateExpertNames(2)

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
    cy.fixture('projectDetails').then(projectDetailsFixture => {
      projectDetails = projectDetailsFixture
    })
    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers
      cy.requestLogIn(
        testUsers.accountManager.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(quickLoginResponse => {
        authToken = quickLoginResponse.body.token
        localStorage = quickLoginResponse.body
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.wrap(expertsData).each(expert => {
          cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = expert.firstName
            expertCreateObject.lastName = expert.lastName
            expertCreateObject.originalName = expert.originalName
            expertCreateObject.email = expert.email
            cy.requestCreateExpert(authToken, expertCreateObject).then(
              expertCreateResponse =>
                createdExperts.push({
                  expertId: expertCreateResponse.body.id,
                  fullName: expertCreateObject.originalName
                })
            )
          })
        })
      })
    })
    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id
        cy.addAndInviteExpertIdToProjectFromAPI(
          projectId,
          createdExperts[0].expertId
        ).then(
          addAndInviteExpertToProjectFromAPIResponse => {
            eplId1 =
              addAndInviteExpertToProjectFromAPIResponse.body[0].employees[0].employeeToEPL.expertProjectLinkId
          }
        )
        cy.addAndInviteExpertIdToProjectFromAPI(
          projectId,
          createdExperts[1].expertId
        ).then(
          addAndInviteExpertToProjectFromAPIResponse => {
            eplId2 =
              addAndInviteExpertToProjectFromAPIResponse.body[0].employees[0].employeeToEPL.expertProjectLinkId
          }
        )
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        expertInvitePage.getExpertsPipelineButton().click()
      })
  })
  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.intercept('GET', '**/translate?**').as('waitForScheduleTool')
  })
  it('Schedule / Reschedule to an existing zoom meeting', function () {
    cy.clickEplExpertToExpand(createdExperts[0].fullName)
    expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
    cy.verifyNotificationAndClose()
    expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
    expertPipelinePage
      .getIconForFeeDescription()
      .should('be.visible')
      .click()
    cy.verifyNotificationAndClose()
    cy.changeEPLStatus(createdExperts[0].fullName, 'Submitted')
    expertPipelinePage.getEplStatusConfirmButton().click()
    cy.verifyNotificationAndClose()
    cy.checkEPLStatus(createdExperts[0].fullName, 'Submitted')
    cy.clickEplExpertToExpand(createdExperts[0].fullName)
    fasterSchedulingPage.getCalendarIconByEpl(eplId1)
      .should('be.visible').click()
    cy.wait('@waitForScheduleTool')
      .its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    fasterSchedulingPage.getNextDayButton().should('be.visible').click()
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('exist')
      .click({ force: true })
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('not.contain', 'Quick')
    fasterSchedulingPage
      .getConfirmSlotButton()
      .should('be.visible')
      .click()
    cy.waitForLoadingDisappear()
    cy.clickEplExpertToExpand(createdExperts[1].fullName)
    expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
    expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
    expertPipelinePage
      .getIconForFeeDescription()
      .should('be.visible')
      .click()
    cy.changeEPLStatus(createdExperts[1].fullName, 'Submitted')
    expertPipelinePage.getEplStatusConfirmButton().click()
    cy.verifyNotificationAndClose()
    cy.checkEPLStatus(createdExperts[1].fullName, 'Submitted')
    cy.clickEplExpertToExpand(createdExperts[1].fullName)
    fasterSchedulingPage.getCalendarIconByEpl(eplId1)
      .should('be.visible').click()
    fasterSchedulingPage.getAddAnotherExpertButton()
      .should('be.visible').click()
    fasterSchedulingPage.selectAddAnotherExpert()
      .should('be.visible').check({ force: true })
    cy.get('.button--primary').scrollIntoView()
      .should('be.visible').click()
    cy.waitForLoadingDisappear()
    fasterSchedulingPage.getMultiExpertMeetingHeadnig()
      .should('be.visible')
      .should('have.text', 'Multi Expert Meeting')
    expertPipelinePage.getDataOnEplByEplid(eplId1)
      .should('be.visible')
      .then($date => {
        dateForEpl1 = $date.text()
      })
    expertPipelinePage.getDataOnEplByEplid(eplId2)
      .should('be.visible')
      .then($date => {
        dateForEpl2 = $date.text()
        expect(dateForEpl1).to.eq(dateForEpl2)
      })
    expertPipelinePage.getTimeOnEplByEplid(eplId1)
      .should('be.visible')
      .then($time => {
        timeForEpl1 = $time.text()
      })
    expertPipelinePage.getTimeOnEplByEplid(eplId2)
      .should('be.visible')
      .then($time => {
        timeForEpl2 = $time.text()
        expect(timeForEpl1).to.eq(timeForEpl2)
      })
    expertPipelinePage.getMultiExpertActionButton()
      .should('be.visible').click()
    expertPipelinePage.getMultiExpertActionOptionToReschedule()
      .should('be.visible').click()

    cy.waitForLoadingDisappear()
    fasterSchedulingPage.getNextDayButton()
      .click({ force: true })
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('exist')
      .click({ force: true })
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('not.contain', 'Quick')
    fasterSchedulingPage
      .getConfirmSlotButton()
      .should('be.visible')
      .click()
    cy.waitForLoadingDisappear()
    expertPipelinePage.getMultiExpertActionButton()
      .should('be.visible').click()
    expertPipelinePage.getMultiExpertActionOptionToComplete()
      .should('be.visible')
      .click()

    cy.intercept('GET', '**/api/expert-project-link/**').as(
      'waitForEPLToUpdate')
    cy.wait('@waitForEPLToUpdate')
      .its('response.statusCode').should('eq', 200)
    cy.checkEPLStatus(createdExperts[0].fullName, 'Interviewed')
    cy.wait('@waitForEPLToUpdate')
      .its('response.statusCode').should('eq', 200)
    cy.checkEPLStatus(createdExperts[1].fullName, 'Interviewed')
  })
})
import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'

describe('Updating zoom title', { tags: "regression" }, function () {
  let testUsers,
    projectId,
    projectDetails,
    localStorage,
    eplId,
    segmentId,
    authToken

  let expertData = generator.generateExpertNames(1)[0]

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const expertInvitePage = new ExpertInvitePage()
  const fasterSchedulingPage = new FasterSchedulingPage()
  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers
    })
    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id

        cy.fixture('projectDetails').then(projectDetailsFixture => {
          projectDetails = projectDetailsFixture
          cy.requestLogIn(
            testUsers.accountManager.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(quickLoginResponse => {
            localStorage = quickLoginResponse.body
            authToken = quickLoginResponse.body.token
            cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
              expertCreateObject.firstName = expertData.firstName
              expertCreateObject.lastName = expertData.lastName
              expertCreateObject.originalName = expertData.originalName
              expertCreateObject.email = expertData.email
              cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                expertCreateResponse => {
                  cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                    addAndInviteExpertToProjectFromAPIResponse => {
                      eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                      segmentId = projectCreateResponse.body.segmentId

                      // Add Fee and hono
                      cy.fixture('objects/eplExpandedObject').then(eplRequestData => {
                        eplRequestData.segmentId = segmentId
                        eplRequestData.honorarium = projectDetails.honorariumAmount
                        eplRequestData.fee = projectDetails.feeAmountField
                        cy.requestPutEPLExpanded(authToken, eplId, eplRequestData)

                        // Change EPL to submitted 
                        cy.requestGetEPL(authToken, eplId).then(eplRequestDataResponse => {
                          eplRequestDataResponse.body.eplStatusId = 5
                          eplRequestDataResponse.body.relevantExperience.experience.company = eplRequestDataResponse.body.relevantExperience.experience.company.name
                          eplRequestDataResponse.body.relevantExperience.experience.position = eplRequestDataResponse.body.relevantExperience.experience.position.name
                          cy.requestPutEPL(authToken, eplId, eplRequestDataResponse.body)

                          cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                          cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
                          expertInvitePage.getExpertsPipelineButton().click()
                        })
                      })
                    })
                }
              )
            })
          })
        })
      })
  })


  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.intercept('GET', '**/translate?**').as('waitForScheduleTool')
    cy.intercept('POST', '**/api/project/**/zoom-meetings').as(
      'waitForZoomMeting')
    cy.intercept('GET', '**/employee-submitted').as(
      'apiRequestForSubmittedEmployee'
    )
    cy.intercept('GET', '**/client-to-project-availability/**').as(
      'apiRequestForClientAvailability'
    )
    cy.intercept('GET', '**/api/expert-project-link/**/employee-submitted').as(
      'apiRequestForSubmittedEmployee'
    )
  })

  it('Should check if zoom meeting title is updated', function () {
    cy.waitForLoadingDisappear()
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()

    cy.wait('@waitForScheduleTool')
      .its('response.statusCode').should('eq', 200)

    cy.waitForLoadingDisappear()

    fasterSchedulingPage
      .getZoomCreationCustomButton()
      .should('be.visible')
      .click({ force: true })

    fasterSchedulingPage
      .getZoomTopicField()
      .should('be.visible')
      .clear()
      .type('updated zoom')

    fasterSchedulingPage
      .getConfirmButtonForZoomMeeting()
      .should('be.visible')
      .click()

    fasterSchedulingPage
      .getExpertInviteModifyButton()
      .should('be.visible')
      .click({ force: true })

    fasterSchedulingPage
      .getSubjectOfInvite()
      .should('be.visible')
      .then($el => {
        const text = $el.val()
        expect(text).to.include('updated zoom')
      })

    fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()

    fasterSchedulingPage
      .getClientInviteModifyButton()
      .should('be.visible')
      .click({ force: true })

    fasterSchedulingPage
      .getSubjectOfInvite()
      .should('be.visible')
      .then($el => {
        const text = $el.val()
        expect(text).to.include('updated zoom')
      })

    fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()

    fasterSchedulingPage.getConfirmSlotButton().should('be.visible').click()

    cy.waitForLoadingDisappear()
    cy.waitForLoadingDisappear()

    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.wait('@apiRequestForSubmittedEmployee')
      .its('response.statusCode')
      .should('eq', 200)

    cy.waitForLoadingDisappear()
    cy.wait('@waitForZoomMeting').its('response.statusCode').should('eq', 200)
    cy.wait('@apiRequestForClientAvailability').its('response.statusCode').should('eq', 200)
    cy.wait('@apiRequestForSubmittedEmployee').its('response.statusCode').should('eq', 200)
    fasterSchedulingPage
      .getExpertInviteModifyOnOverview()
      .should('be.visible')
      .click({ force: true })

    fasterSchedulingPage
      .getSubjectOfInvite()
      .should('be.visible')
      .then($el => {
        const text = $el.val()
        expect(text).to.include('updated zoom')
      })

    fasterSchedulingPage.getSendCalendarInvitBtn().click()
    fasterSchedulingPage
      .getClientInviteModifyOnOverview()
      .should('be.visible')
      .click({ force: true })

    fasterSchedulingPage
      .getSubjectOfInvite()
      .should('be.visible')
      .then($el => {
        const text = $el.val()
        expect(text).to.include('updated zoom')
      })

    fasterSchedulingPage.getCloseIcon().should('be.visible').click()
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.waitForLoadingDisappear()

    fasterSchedulingPage
      .getCancelIconInScheduleOverview()
      .should('be.visible')
      .click()

    fasterSchedulingPage
      .getCancelOptionsDropdownOnScheduleOverview()
      .should('be.visible')
      .click()

    fasterSchedulingPage
      .getOneCancelOptionOnScheduleOverview()
      .should('be.visible')
      .click()

    fasterSchedulingPage
      .getConfirmationButtonOnScheduleOverview()
      .should('be.visible')
      .click()

    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Not interviewed')
  })
})

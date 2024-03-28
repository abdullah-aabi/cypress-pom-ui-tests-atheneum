import GlobalPage from '../../../pageObjects/GlobalPage'
import ClientsAppPage from '../../../pageObjects/ClientsAppPage'
import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import generator from '../../../support/generator'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'

describe('Associate Changing the expert pipeline status and verify', { tags: "regression" }, function () {
  let projectDetails, localStorageAssociate, localStorageTeamLeader, testUsers, projectId, clientProjectLink
  const projectName = `${generator.generateTestName()} Expert Sessions project`

  const firstName = generator.generateFirstName()
  const lastName = generator.generateLastName()

  let expertData = {
    firstName: firstName,
    lastName: lastName,
    originalName: `${firstName} ${lastName}`,
    email: `${firstName + lastName}@mail.com`
  }

  const clientsAppPage = new ClientsAppPage()
  const expertsAppPage = new ExpertsAppPage()
  const globalPage = new GlobalPage()
  const expertInvitePage = new ExpertInvitePage()
  const expertPipelinePage = new ExpertPipelinPage()
  const scheduling = new AvailabilitiesAndScheduling()
  const fasterSchedulingPage = new FasterSchedulingPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id
        cy.fixture('projectDetails').then(projectDetailsFixture => {
          projectDetails = projectDetailsFixture
          cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
              testusers.associate.emailAddress,
              Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
              localStorageAssociate = loginResponse.body
            })

            cy.requestClientsLogin(testusers.avenComplianceAuditor.emailAddress, Cypress.env('CYPRESS_EXTERNAL_PASSWORD')).then(
              loginResponse => cy.requestClientsGetProjectExternLink(loginResponse.body.token, projectId).then(
                projectLinkResponse => {
                  clientProjectLink = projectLinkResponse.body.externLink
                }
              )
            )

            cy.requestLogIn(
              testusers.teamLeader.emailAddress,
              Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
              localStorageTeamLeader = loginResponse.body
            })
          })
        })

        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
          expertCreateObject.firstName = expertData.firstName
          expertCreateObject.lastName = expertData.lastName
          expertCreateObject.originalName = expertData.originalName
          expertCreateObject.email = expertData.email
          cy.requestCreateExpert(localStorageTeamLeader.token, expertCreateObject).then(
            expertCreateResponse =>
              cy.requestLoginAsExpertById(expertCreateResponse.body.id).then(
                expertQuickLoginResponse => {
                  cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
                  cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)

                  expertData.expertAuth = expertQuickLoginResponse.body
                }
              )
          )
        })
      }
    )
  })

  it('expert should check Experts page that the EPL status is Invited', function () {
    cy.visit(`${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/auth/quick-login?token=${expertData.expertAuth.token}&location=/new-consultations`)
    expertsAppPage.getComplianceButton('Confirm').click()
    expertsAppPage.getConsultationCardTitleInvitations().should('contain', projectName)
  })

  it('associate should change EPL status from Submitted to Requested', function () {
    cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)

    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
    )
    cy.waitForLoadingDisappear()
    cy.wait(500)
    cy.changeEPLStatus(expertData.originalName, 'Submitted')

    expertPipelinePage.getEplStatusConfirmButton().click()
    cy.verifyNotificationAndClose()
    cy.checkEPLStatus(expertData.originalName, 'Submitted')
    cy.changeEPLStatus(expertData.originalName, 'Requested')
    expertPipelinePage.getEplStatusConfirmButton().click()
    cy.verifyNotificationAndClose()
    cy.checkEPLStatus(expertData.originalName, 'Requested')
  })

  it('client should check Clients page that the EPL status is Submitted', function () {
    cy.visit(clientProjectLink)
    clientsAppPage.getExpertName().should('have.text', expertData.originalName)
    clientsAppPage.getEPLAction().should('have.text', 'Scheduling requested')
  })

  it('associate should change EPL status to Scheduled and send expert and client email invite', function () {
    cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)

    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
    )
    cy.waitForLoadingDisappear()
    cy.checkEPLStatus(expertData.originalName, 'Requested')
    cy.wait(500)
    cy.clickEplExpertToExpand(expertData.originalName)
    expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
    cy.verifyNotificationAndClose()
    expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
    expertPipelinePage
      .getIconForFeeDescription()
      .should('be.visible')
      .click()
    cy.verifyNotificationAndClose()
    cy.changeEPLStatus(expertData.originalName, 'Scheduled')
    cy.waitForLoadingDisappear()
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('exist')
      .click({ force: true })
    cy.wait(2000)
    fasterSchedulingPage
      .getConfirmSlotButton()
      .should('be.visible')
      .click()
    globalPage.getNotificationTitle()
      .should('contain.text', 'Success!')
    globalPage.getNotificationMessage()
      .should('contain.text', 'Updating schedule...')
    globalPage.getNotificationTitle()
      .should('contain.text', 'Success!')
    globalPage.getNotificationMessage()
      .should('contain.text', 'Schedule Updated')
    cy.waitForLoadingDisappear()
    cy.checkEPLStatus(expertData.originalName, 'Scheduled')
  })

  it('expert should check Experts page that the EPL status is Scheduled', function () {
    cy.visit(`${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/auth/quick-login?token=${expertData.expertAuth.token}&location=/new-consultations`)
    expertsAppPage.getScheduledConsultationCard().should('contain', projectName)
  })

  it('client should check Clients page that the EPL status is Scheduled', function () {
    cy.visit(clientProjectLink)
    clientsAppPage.getClientTabLink().contains('Scheduled').click()
    clientsAppPage.getExpertName().should('have.text', expertData.originalName)
    clientsAppPage.getFeeAmount().should('contain.text', projectDetails.feeAmountField)
    clientsAppPage.getEPLAction().should('contain.text', 'Scheduled on ')
  })

  it('team leader should change EPL status to Interviewed and create a new Hon. & Fee Bundle', function () {
    cy.setLocalStorageLoginInfo(localStorageTeamLeader.user, localStorageTeamLeader.token)

    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
    )
    cy.waitForLoadingDisappear()
    cy.checkEPLStatus(expertData.originalName, 'Scheduled')
    expertInvitePage
      .getExpertsPipelineButton()
      .scrollIntoView()
      .click()
    cy.changeEPLStatus(expertData.originalName, 'Interviewed')

    scheduling.getConfirmInterviewButton().click()
    scheduling
      .getCurrencyTypeFieldList()
      .first()
      .should('have.text', projectDetails.feeCurrency)
    scheduling
      .getInterviewDurationField()
      .should('have.value', projectDetails.interviewDuration)
    scheduling
      .getFeeValueAmountOnBundle()
      .should('have.value', projectDetails.feeAmountField)
    scheduling.getHonorariumExpertName().should('have.value', expertData.originalName)
    scheduling
      .getCurrencyTypeFieldList()
      .last()
      .should('have.text', projectDetails.honorariumCurrency)
    scheduling
      .getHonorariumCostValue()
      .should('have.value', projectDetails.honorariumAmount)
    scheduling.getConfirmInterviewButton().click()
    globalPage.getNotificationTitle().should('have.text', 'Saved')
    globalPage
      .getNotificationMessage()
      .should('contain.text', 'Hon. & Fee Bundle succeeded.')
    cy.checkEPLStatus(expertData.originalName, 'Interviewed')
    cy.verifyExpertReplyStatus(expertData.originalName, 'Confirmed')
  })

  it('expert should check Experts page that the EPL status is Interviewed', function () {
    cy.visit(`${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/auth/quick-login?token=${expertData.expertAuth.token}&location=/new-consultations`)
    expertsAppPage.getPastConsultationsLink().click()
    expertsAppPage.getPastConsultationProjectName().should('have.text', projectName)
    expertsAppPage.getPastConsultationHonorarium().should('have.text', `${projectDetails.honorariumAmount} ${projectDetails.honorariumCurrency}`)
    expertsAppPage.getPastConsultationPaymentStatus().should('have.text', 'Collecting payment details')
    expertsAppPage.getSignOutBtn().click()
    cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
  })

  it('client should check Clients page that the EPL status is Interviewed', function () {
    cy.visit(clientProjectLink)
    clientsAppPage.getClientTabLink().contains('Interviewed').click()
    clientsAppPage.getExpertName().should('have.text', expertData.originalName)
    clientsAppPage.getFeeAmount().should('contain.text', projectDetails.feeAmountField)
    clientsAppPage.getEPLAction().should('contain.text', 'Interviewed on ')
  })
})

import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
const downloadsFolder = Cypress.config("downloadsFolder");
const path = require("path");

describe('Expert Relationship Manager Compliance Tests', { tags: "regression" }, function () {
  let expertData, testUsers, authToken, localStorage, policyValue, noticeValue
  let createdExperts = []
  let expertsData = generator.generateExpertNames(5)
  const projectName = `${generator.generateTestName()} Expert Sessions project`

  const globalPage = new GlobalPage()
  const expertsAppPage = new ExpertsAppPage()
  const expertDetailsPage = new ExpertDetailsPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers

      cy.requestLogIn(
        testUsers.erm.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(quickLoginResponse => {
        authToken = quickLoginResponse.body.token
        localStorage = quickLoginResponse.body

        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
      })
    })

    cy.fixture('expertDetails').then(expertDetails => {
      expertData = expertDetails
    })

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
    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        let projectId = projectCreateResponse.body.id
        cy.addExpertAsInterestedToProjectFromAPI(
          projectId,
          createdExperts[3].expertId
        )
      }
    )
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.intercept('GET', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/employee/extern-typeahead?q=*`).as('searchExpert')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/email-check`).as('getprofile')
  })

  it('should send compliance request when the ERM clicks send compliance request link and check the expert status', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId
      }`
    )
    expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')

    expertDetailsPage.selectSendComplianceRequest('English')
    globalPage
      .getNotificationMessage()
      .should('contain', expertData.expertComplianceRequestSentMessage)

    expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance requested')
  })

  it('should not change Expert status when status is Cold Prospect and the expert Disagrees the Compliance', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[1].expertId
      }`
    )
    expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')

    cy.requestLoginAsExpertById(createdExperts[1].expertId).then(
      expertQuickLoginResponse => {
        cy.requestExpertDisagreeCompliance(
          expertQuickLoginResponse.body.token,
          {
            fullName: createdExperts[1].fullName,
            userId: createdExperts[1].expertId,
            complianceReferrer: null
          }
        )
      }
    )

    cy.reload()
    expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
  })

  it('should set expert status to Active Expert when status is Cold Prospect and the expert Accepts the Compliance', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[1].expertId
      }`
    )
    expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
    expertDetailsPage
      .getSherlock()
      .should('not.exist')

    cy.requestLoginAsExpertById(createdExperts[1].expertId).then(
      expertQuickLoginResponse => {
        cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
      }
    )

    cy.reload()
    expertDetailsPage.getStatusLabel().should('have.text', 'Active Expert')
    expertDetailsPage
      .getComplianceInPlace()
      .should('contain', 'Compliance in place since')
  })

  it.skip('should not update Expert status when status is Do not Contact and the expert Disagrees the Compliance', function () {
    cy.requestExpertSetStatus(authToken, createdExperts[2].expertId, {
      commentPrefix: 'do not contact reason: ',
      statusChangeComment: 'Test expert'
    })
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[2].expertId
      }`
    )

    expertDetailsPage.getStatusLabel().should('have.text', 'Do Not Contact')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
    expertDetailsPage
      .getSherlock()
      .should(
        'have.text',
        expertData.sherlockWarningMessage
      ).click()

    expertDetailsPage.getSherlockReasonTooltip().should(
      'have.text',
      expertData.sherlockDontContactMessage + expertsData[2].email)

    cy.requestLoginAsExpertById(createdExperts[2].expertId).then(
      expertQuickLoginResponse => {
        cy.requestExpertDisagreeCompliance(
          expertQuickLoginResponse.body.token,
          {
            fullName: createdExperts[2].fullName,
            userId: createdExperts[2].expertId,
            complianceReferrer: null
          }
        )
      }
    )

    cy.reload()
    expertDetailsPage.getStatusLabel().should('have.text', 'Do Not Contact')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
  })

  it.skip('should not update Expert status when status is Do not Contact and the expert Accepts the Compliance', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[2].expertId
      }`
    )

    expertDetailsPage.getStatusLabel().should('have.text', 'Do Not Contact')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
    expertDetailsPage
      .getSherlock()
      .should(
        'have.text',
        expertData.sherlockWarningMessage
      ).click()

    expertDetailsPage.getSherlockReasonTooltip().should(
      'have.text',
      expertData.sherlockDontContactMessage + expertsData[2].email)

    cy.requestLoginAsExpertById(createdExperts[2].expertId).then(
      expertQuickLoginResponse => {
        cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
      }
    )

    cy.reload()
    expertDetailsPage.getStatusLabel().should('have.text', 'Do Not Contact')
    expertDetailsPage
      .getComplianceInPlace()
      .should('contain', 'Compliance in place since')
  })

  it('should not update Expert status when status is Warm Prospect and the expert Disagrees the Compliance', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[3].expertId
      }`
    )

    expertDetailsPage.getStatusLabel().should('have.text', 'Warm Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')

    cy.requestLoginAsExpertById(createdExperts[3].expertId).then(
      expertQuickLoginResponse => {
        cy.requestExpertDisagreeCompliance(
          expertQuickLoginResponse.body.token,
          {
            fullName: createdExperts[3].fullName,
            userId: createdExperts[3].expertId,
            complianceReferrer: null
          }
        )
      }
    )

    cy.reload()
    expertDetailsPage.getStatusLabel().should('have.text', 'Warm Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
  })

  it('should set expert status to Active Expert when status is Warm Prospect and the expert Accepts the Compliance', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[3].expertId
      }`
    )

    expertDetailsPage.getStatusLabel().should('have.text', 'Warm Prospect')
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')

    cy.requestLoginAsExpertById(createdExperts[3].expertId).then(
      expertQuickLoginResponse => {
        cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
        cy.visit(expertQuickLoginResponse.body.link)
        expertsAppPage.getSignOutBtn().click()
        cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
      }
    )

    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[3].expertId}`)
    expertDetailsPage.getStatusLabel().should('have.text', 'Active Expert')
    expertDetailsPage.getComplianceInPlace()
      .should('contain', 'Compliance in place since')
  })

  it('should verify privacy policy', function () {

    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/compliance`)
    expertsAppPage.selectTestAccountMAnager('Test AccountManager')
    cy.wait('@searchExpert')
    expertsAppPage.getExpertComplianceEmailAddress().type(expertsData[4].email)
    expertsAppPage.getExpertComplianceNextButton().click()
    expertsAppPage.getExpertComplianceNextButton().click()

    expertsAppPage.getPrivacyPolicy().should('be.visible').click()
    expertsAppPage.getPrivacyPolicyLink().then(value => {
      const splitValue = value.split('/')
      policyValue = splitValue[3]
      cy.readFile(path.join(downloadsFolder, policyValue)).should("exist");
    })

    expertsAppPage.getPrivacyPolicyNotice().should('be.visible').click()
    expertsAppPage.getPrivacyPolicyNoticeLink().then(value => {
      const splitValue = value.split('/')
      noticeValue = splitValue[3]
      cy.readFile(path.join(downloadsFolder, noticeValue)).should("exist");
    })
  })

  it('should verify recruited by', function () {
    expertsAppPage.getAgree().click()
    expertsAppPage.getAgree().click()
    cy.wait('@getprofile')
    const expID = createdExperts[4].expertId
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${expID}`)
    expertsAppPage.getRecruitedBy().then(value => {
      expect(value.text()).to.eql('Test Accountmanager')
    })
  })
})
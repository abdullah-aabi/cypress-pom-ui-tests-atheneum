import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import BundleCreationPage from '../../../pageObjects/BundleCreationPage'
let eplData = require('../../../fixtures/hcpEPLData.json')

describe('HCP expert submission', { tags: ["regression", "smoke"] }, function () {
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

            // Location
            expertCreateObject.address.city = 'Paris'
            expertCreateObject.address.state = 'France'
            expertCreateObject.address.countryId = 69
            expertCreateObject.address.timezoneId = 156

            // subIndustry
            expertCreateObject.expert.subIndustries[0].id = 27
            expertCreateObject.expert.subIndustries[0].type = "subIndustry"
            expertCreateObject.expert.subIndustries[0].name = "Health Care Professionals"
            expertCreateObject.expert.subIndustries[0].industryId = 4


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
          expertInvitePage.getExpertsPipelineButton().click()
        })
      }
    )
  })
  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.intercept('POST', `**/api/expert-project-link/**/hcpAdditionalInfo`).as('hcpResponse')
  })

  it('Update Epl status and submit HCP form', function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
    cy.waitForLoadingDisappear()
    expertInvitePage.getEPLStatusDropdown().click()
    expertInvitePage.selectEplStatus().contains('Submitted').click()
    globalPage.getDialogPrimaryButton().click()

    expertInvitePage.selectEplReason()
    expertInvitePage.selectEplBeneficiary()
    expertInvitePage.selectEplProIdentifier()
    expertInvitePage.getExpertProId().type(eplData.hcpSubmit.professionalIdentifierNumber)

    expertInvitePage.selectEplProfession()

    globalPage.getAddress().type(eplData.hcpSubmit.address)
    globalPage.getCity().type(eplData.hcpSubmit.city)
    globalPage.getZipCode().type(eplData.hcpSubmit.zipCode)

    globalPage.getFormPrimaryButton().click()
    cy.wait('@hcpResponse').its('response').then((res) => {
      expect(res.statusCode).to.eql(200)
      expect(res.body, 'response body').to.deep.contain(eplData.hcpSubmit)
    })
    globalPage.getNotificationMessage().should('contain.text', 'EPL successfully updated.')
    expertInvitePage.getEPLStatusDropdown().should('contain.text', 'Submitted')
  })

  it('Should verify honorarium limit in Epl', function () {
    expertInvitePage.getExpertInfo().click()
    cy.waitForLoadingDisappear()
    expertInvitePage.getHonorariumInput().type('201')
    globalPage.getNotificationMessage().should('contain.text', 'French Sunshine Act - exceeded maximum value.')
    expertInvitePage.getHonorariumInput().should('have.value', '200')
  })

  it.skip('Should create new Hon. & Fee Bundle', function () {
    // Update epl status to scheduled
    cy.requestPutEPL(authToken, eplId, { "eplStatusId": 8 })
    // Update epl status to interviewed
    cy.requestPutEPL(authToken, eplId, { "eplStatusId": 10, "interviewDate": generator.returnDateinYYYYMMDDFormat() })
    cy.reload()
    cy.waitForLoadingDisappear()

    expertPipelinePage.getBundleCreate().click()
    cy.waitForLoadingDisappear()
    expertPipelinePage.getDialogHeader().should('contain.text', 'Hon. & Fee Bundle')
    bundleCreationPage.getCostValue().clear().type('400')
    globalPage.getNotificationMessage().should('contain.text', 'French Sunshine Act - exceeded maximum value.')
    expertInvitePage.getHonorariumInput().should('have.value', '200')

  })

})
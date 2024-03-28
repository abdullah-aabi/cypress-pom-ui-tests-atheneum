import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'

describe('Add/Invite expert to project With various selection', { tags: ["regression", "smoke"] }, function () {
  let projectDetails, testUsers, authToken, employeeFullName, expertDetails
  let expertNamesData = generator.generateExpertNames(20)
  let createdExperts = []

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const expertInvitePage = new ExpertInvitePage()
  const expertPipelinePage = new ExpertPipelinePage()
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
                fullName: expertCreateObject.originalName
              })
          )
        })
      })
    })

    cy.createProjectFromAPI(projectName, 'Expert Sessions')

    cy.fixture('projectDetails').then(testData => {
      projectDetails = testData
    })

    cy.fixture('expertDetails').then(testData => {
      expertDetails = testData
    })
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/expert-invite-template`).as('updateLanguage')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
    cy.intercept('GET', '**/items?offset=0').as('waitToLoadList')
    cy.intercept('POST', '**/bulk-validate').as('waitForbulkValidate')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-invite-to-project`).as('bulkInviteToProjectRequest')
  })

  it('should select add and Invite expert to the project', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[0].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    expertInvitePage.getExpertInviteButton().contains('Add & Invite').click()
    cy.waitForLoadingDisappear()
    expertInvitePage.selectRelevantPosition(expertDetails.experiences[1].position)

    cy.clickInviteActionButton('Add and invite')
    cy.waitForLoadingDisappear()

    expertInvitePage
      .getNumberOfExpertField()
      .should('have.attr', 'value', projectDetails.noOfExperts)
    projectDetailsPage
      .getScreeningTextAreaList()
      .first()
      .contains(projectDetails.screeningDefaultQuestion)
    projectDetailsPage
      .getScreeningTextAreaList()
      .last()
      .contains(projectDetails.screeningQuestion2)

    expertInvitePage.selectAssignedAssociatesField(employeeFullName)
    expertInvitePage.getSaveButton().click()
    cy.waitForLoadingDisappear()

    expertInvitePage
      .getSendEmailSenderField()
      .should('have.text', employeeFullName)
    expertInvitePage.getSendEmailToField().contains(createdExperts[0].fullName)
    expertInvitePage.getTemplateDropdown().click().clear().type('CN{enter}')
    cy.wait('@updateLanguage')
    expertInvitePage.getToValue().should('contain.text', createdExperts[0].fullName)
    expertInvitePage.getSaveButton().click()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
  })

  it('should select Add & set reply to INTERESTED and verify success message', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[1].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    expertInvitePage.getExpertInviteButton().contains('Interested').invoke('show').click({ force: true })
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
  })

  it('should select Add & set reply to APPLIED and verify success message', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[2].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    expertInvitePage.getExpertInviteButton().contains('Applied').invoke('show').click({ force: true })
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
  })

  it('should select Add & set reply to CONFIRMED and verify success message', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[3].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    expertInvitePage.getExpertInviteButton().contains('Confirmed').invoke('show').click({ force: true })
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
  })

  it('should select Add & set reply to NOT CONTACTED and verify success message', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[4].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    expertInvitePage.getExpertInviteButton().contains('Not Contacted').invoke('show').click({ force: true })
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
  })

  it('should select 1-Click Invite and verify success message', function () {
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[5].expertId
      }`
    )
    cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
    expertInvitePage.selectProjectField(projectName)
    cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    expertInvitePage.getExpertInviteButton().contains('1-Click Invite').click()
    cy.waitForLoadingDisappear()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
  })

  it('should verify experts pipeline data', function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project-search`)
    globalPage.searchAnythingAndSelectValue(projectName)
    cy.waitForLoadingDisappear()
    expertInvitePage.getExpertsPipelineButton().click()

    cy.verifyExpertReplyStatus(createdExperts[0].fullName, 'Invited')
    let time = generator.getCurrentTime()
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[0].fullName, expertDetails.experiences[1].position)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[0].fullName, expertDetails.experiences[1].company)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[0].fullName, expertDetails.experiences[1].location)
    expertPipelinePage.checkEPLCurrentTime(createdExperts[0].fullName, time, 1)

    cy.verifyExpertReplyStatus(createdExperts[2].fullName, 'Applied')
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[2].fullName, expertDetails.experiences[2].position)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[2].fullName, expertDetails.experiences[2].company)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[2].fullName, expertDetails.experiences[2].location)
    cy.verifyExpertReplyStatus(createdExperts[3].fullName, 'Confirmed')
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[3].fullName, expertDetails.experiences[2].position)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[3].fullName, expertDetails.experiences[2].company)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[3].fullName, expertDetails.experiences[2].location)
    cy.verifyExpertReplyStatus(createdExperts[4].fullName, 'Not contacted')
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[4].fullName, expertDetails.experiences[2].position)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[4].fullName, expertDetails.experiences[2].company)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[4].fullName, expertDetails.experiences[2].location)
    cy.verifyExpertReplyStatus(createdExperts[5].fullName, 'Invited')
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[5].fullName, expertDetails.experiences[2].position)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[5].fullName, expertDetails.experiences[2].company)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[5].fullName, expertDetails.experiences[2].location)

    cy.verifyExpertReplyStatus(createdExperts[1].fullName, 'Interested')
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[1].fullName, expertDetails.experiences[2].position)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[1].fullName, expertDetails.experiences[2].company)
    expertPipelinePage.checkEPLRelevantPosition(createdExperts[1].fullName, expertDetails.experiences[2].location)

    projectDetailsPage.getSelectAllEPLsCheckbox().click()
        globalPage.getActionButtonByName('Send invite').click()

        expertInvitePage.getSendEmailToField().each((expectedExpertName, index, $list) => {
            expect(expectedExpertName[0].childNodes[0].nodeValue).to.equal(createdExperts[index].fullName)
        })

        expertInvitePage.getSaveButton().click()
        cy.wait('@bulkInviteToProjectRequest')
        expertInvitePage
        .getExpertInvitedMessage()
        .should(
            'contain.text',
            projectDetails.expertsInviteMessageOnPipeline)
    expertInvitePage
        .getInvitedExpertName().then(expertsNames => {
            let expectedExpertList = expertsNames.text()
                .split(',')
                .map(expert => expert.trim())

            expectedExpertList.forEach((expectedExpertName, index) => {
                expect(expectedExpertName).to.equal(expertNamesData[index].originalName);
            })
        })
        cy.get('[type="button"]').contains('Ok').click()
            expertPipelinePage.checkEPLCurrentTime(createdExperts[0].fullName, generator.getCurrentTime(), 0)
  
  })
})

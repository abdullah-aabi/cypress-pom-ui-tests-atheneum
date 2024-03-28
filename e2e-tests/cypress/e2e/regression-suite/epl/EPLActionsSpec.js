import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'
import GetLinksPage from '../../../pageObjects/GetLinksPage'

describe('Associate copy, export and sharing EPLs', { tags: ["regression", "smoke"] }, function () {
  let authInfo, projectDetails, reportData,
    projectId, clientContactName

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const projectDetailsPage = new ProjectDetailsPage()
  const globalPage = new GlobalPage()
  const expertsAppPage = new ExpertsAppPage()
  const expertDetailsPage = new ExpertDetailsPage()
  const expertPipelinePage = new ExpertPipelinPage()
  const getLinksPage = new GetLinksPage()

  const firstName = generator.generateFirstName()
  const lastName = generator.generateLastName()
  const currentTime = generator.convertDateToFormat(new Date(), 'YYYYMMDD')

  const expertData = {
    firstName: firstName,
    lastName: lastName,
    originalName: `${firstName} ${lastName}`,
    email: `${firstName + lastName}@mail.com`
  }

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id
        clientContactName = projectCreateResponse.body.clients[0].fullName

        cy.fixture('projectDetails').then(testData => projectDetails = testData)
        cy.fixture('reportData').then(report => reportData = report)

        cy.fixture('testUsers').then(testUsers => {
          cy.requestLogIn(
            testUsers.associate.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(loginResponse => {
            authInfo = loginResponse
          })


          cy.requestLogIn(
            testUsers.accountManager.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(loginResponse => {
            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
              expertCreateObject.firstName = expertData.firstName
              expertCreateObject.lastName = expertData.lastName
              expertCreateObject.originalName = expertData.originalName
              expertCreateObject.email = expertData.email
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

  it('should check Share EPLs button is disabled if no epl is selected', function () {
    projectDetailsPage.getShareEPLDisabledButton().should('be.visible')
  })

  it('should get the client EPL link', function () {
    cy.intercept('POST', '**/extern-link').as('externLinkCall')
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('DISABLED WINDOW PROMPT')
    })

    globalPage.getActionButtonByName('Get link').click()

    cy.wait('@externLinkCall').its('response.body').should('have.property', 'externLink').then((externLink) => {
      globalPage.getPopupTitle().should('have.text', projectDetails.eplLinkModalTitle)
      globalPage.getPopupContent().should('contain.text', externLink)
    })
  })

  it('should check Share EPLs button is disabled if no epl is selected', function () {
    projectDetailsPage.getShareEPLDisabledButton().should('be.visible')
  })

  it('should not be able to Share EPLs if status is less then Submitted', function () {
    cy.wait(500)
    projectDetailsPage.getEPLCheckbox().click()
    globalPage.getActionButtonByName('Share EPL').click()

    globalPage.getNotificationTitle().should('have.text', 'Error!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'One or more experts in a status less than Submitted')
  })

  it('should send compliance reminder if the expert doest have compliance signed', function () {
    cy.wait(500)
    expertDetailsPage
      .getComplianceMissing()
      .should('have.text', 'Compliance missing')
    expertDetailsPage
      .getSherlock()
      .should('not.exist')

    expertsAppPage.selectSendComplianceRequestEmail('English')

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'Compliance in English sent!')

    expertDetailsPage
      .getComplianceMissing()
      .should('contain', 'Compliance requested')
  })

  it('should be able to Share EPLs that are Submitted via email', function () {
    cy.wait(500)
    cy.changeEPLStatus(expertData.originalName, 'Submitted')
    expertPipelinePage.getEplStatusConfirmButton().click()
    cy.verifyNotificationAndClose()
    cy.checkEPLStatus(expertData.originalName, 'Submitted')

    projectDetailsPage.getEPLCheckbox().click()
    globalPage.getActionButtonByName('Share EPL').click()

    globalPage.getPrimaryButtonByName('Send').click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'Extract EPLs email successfully sent')
  })

  it('should be able to export one expert via Excel format Standard', function () {
    cy.wait(500)
    projectDetailsPage.getEPLCheckbox().click()
    globalPage.getActionButtonByName('Export').click()
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.standardHeaders)
    // })
  })

  it('should be able to export all selected experts via Excel format Standard', function () {
    cy.wait(500)
    projectDetailsPage.getEPLCheckbox().click()
    globalPage.getActionButtonByName('Export').click()
    projectDetailsPage.getExportAllExpertsRadio().click()
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.standardHeaders)
    // })
  })

  it('should be able to export without checking all experts via Excel of type Standard format', function () {
    cy.wait(500)
    globalPage.getActionButtonByName('Export').click()
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.standardHeaders)
    // })
  })

  it('should be able to export without checking all experts via Excel of type Bain format', function () {
    cy.wait(500)
    globalPage.getActionButtonByName('Export').click()
    projectDetailsPage.selectExportFileFormat('Bain')
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.bainHeaders)
    // })
  })

  it('should be able to export without checking all experts via Excel of type BCG format', function () {
    cy.wait(500)
    globalPage.getActionButtonByName('Export').click()
    projectDetailsPage.selectExportFileFormat('BCG')
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.bcgHeaders)
    // })
  })

  it('should be able to export without checking all experts via Excel of type PWC format', function () {
    cy.wait(500)
    globalPage.getActionButtonByName('Export').click()
    projectDetailsPage.selectExportFileFormat('PWC')
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.pwcHeaders)
    // })
  })

  it('should be able to export without checking all experts via Excel of type BCG XPRT Tool format', function () {
    cy.wait(500)
    globalPage.getActionButtonByName('Export').click()
    projectDetailsPage.selectExportFileFormat('BCG XPRT Tool')
    globalPage.getPrimaryButtonByName('Export').click()

    globalPage.getPopupTitle().should('have.text', projectDetails.eplExportTitle)
    globalPage.getPopupContent().should('contain.text', projectDetails.eplExportMessage)

    // does not work on CI
    // cy.parseXlsx(`cypress/downloads/${projectName}_${currentTime}.xlsx`).then(report => {
    //   expect(report[0].data[2]).to.include(projectName)
    //   expect(report[0].data[8]).to.deep.equal(reportData.bcgExpertToolHeaders)
    // })
  })
})

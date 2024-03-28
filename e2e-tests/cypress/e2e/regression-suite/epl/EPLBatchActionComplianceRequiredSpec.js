import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'

describe('Associate copy, export and sharing EPLs', { tags: "regression" }, function () {
    let localStorage, expertFullName, testData, projectId
    const projectDetailsPage = new ProjectDetailsPage()
    const globalPage = new GlobalPage()
    const projectName = `${generator.generateTestName()} Expert Sessions project`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testData').then(testData => {
            testData = testData
            cy.fixture('testUsers').then(testUsers => {
                expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName
                    }`
                cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.KPMGOfficeName).then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)
                        cy.requestLogIn(
                            testUsers.accountManager.emailAddress,
                            Cypress.env('CYPRESS_USER_PASSWORD')
                        ).then(quickLoginResponse => {
                            localStorage = quickLoginResponse.body
                            cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                            cy.visit(
                                `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                            )
                        })
                    })
            })
        })
    })

    beforeEach(function () {
        cy.intercept('POST', '**/api/segment').as('waitForAddSegment')
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('should check Assign to status batch action is disabled if no epl is selected', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        globalPage.getActionButtonByName('Batch actions').click()
        projectDetailsPage.getAssignToStatusBatchActionDisableBtn().should('be.visible')
    })

    it('should show error message on applying Batch action if no status is choosen for selected EPL', function () {
        cy.wait(500)
        projectDetailsPage.getEPLCheckbox().click()
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Please select status to assign to!')
        projectDetailsPage.getOkbtnOnErrorMessagePopUp().click()
    })

    it('should show error message on applying Batch action if no segment is choosen for selected EPL', function () {
        cy.wait(500)
        projectDetailsPage.getAssignToSegmentRadioBtn().click()
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Please select segment to assign to!')
        projectDetailsPage.getOkbtnOnErrorMessagePopUp().click()
    })

    it('should move EPL from Recruitment to Compliance audit', function () {
        cy.wait(500)
        projectDetailsPage.getAssignToStatusRadioBtn().click()
        projectDetailsPage.selectStatus('Submitted')
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Are you sure you want to update status for selected EPLs?')
        projectDetailsPage.getYesOnPopUp().click()
        cy.batchActionVerifyNotificationAndClose()
        cy.checkEPLStatus(expertFullName, 'Compliance audit')
    })

    it('should move EPL from Compliance audit to Rejected', function () {
        cy.wait(500)
        projectDetailsPage.getEPLCheckbox().click()
        projectDetailsPage.getAssignToStatusRadioBtn().click()
        projectDetailsPage.selectStatus('Rejected')
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Are you sure you want to update status for selected EPLs?')
        projectDetailsPage.getYesOnPopUp().click()
        cy.batchActionVerifyNotificationAndClose()
        cy.checkEPLStatus(expertFullName, 'Rejected')
    })

    it('should move segment', function () {
        cy.wait(500)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        projectDetailsPage.getAddSegmentBtn().click()
        projectDetailsPage.getSegmentName().type('Lightening Equipment')
        projectDetailsPage.submitButton().click()
        cy.wait('@waitForAddSegment').its('response.statusCode').should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        projectDetailsPage.getFirstSegmentCheckbox().click()
        globalPage.getActionButtonByName('Batch actions').click()
        projectDetailsPage.getAssignToSegmentRadioBtn().click()
        projectDetailsPage.selectSegment('Lightening Equipment')
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Are you sure you want to update segment for selected EPLs?')
        projectDetailsPage.getYesOnPopUp().click()
        cy.batchActionVerifyNotificationAndClose()
        projectDetailsPage.getEmptySegment().should('exist')
        projectDetailsPage.getHeadingOfEmptySegment().should('contain.text', 'Heavy Machinary (0 / 5)')
        projectDetailsPage.getHeadingForSegmentWithExpert().should('contain.text', 'Lightening Equipment (1 / 5)')
        projectDetailsPage.getSegmentWithExpert().should('exist')
    })
})
import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'

describe('Associate copy, export and sharing EPLs', { tags: "regression" }, function () {
    let authInfo, projectId

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const projectDetailsPage = new ProjectDetailsPage()
    const globalPage = new GlobalPage()

    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()

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
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.intercept('POST', '**/api/segment').as('waitForAddSegment')
        cy.intercept('GET', '/api/segment/project/*').as('getProjectSegment')
    })

    it('should check Assign to status batch action is disabled if no epl is selected', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        globalPage.getActionButtonByName('Batch actions').click()
        projectDetailsPage.getAssignToStatusBatchActionDisableBtn().should('be.visible')
    })

    it('should check Assign to segment batch action is disabled if no epl is selected', function () {
        projectDetailsPage.getAssignToSegmentBatchActionDisableBtn().should('be.visible')
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

    it('should move EPL from Recruitment to Submitted', function () {
        cy.wait(500)
        projectDetailsPage.getAssignToStatusRadioBtn().click()
        projectDetailsPage.selectStatus('Submitted')
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Are you sure you want to update status for selected EPLs?')
        projectDetailsPage.getYesOnPopUp().click()
        cy.batchActionVerifyNotificationAndClose()
        cy.checkEPLStatus(expertData.originalName, 'Submitted')
    })

    it('should move EPL from Submitted to Requested', function () {
        cy.wait(500)
        projectDetailsPage.getEPLCheckbox().click()
        projectDetailsPage.getAssignToStatusRadioBtn().click()
        projectDetailsPage.selectStatus('Requested')
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Are you sure you want to update status for selected EPLs?')
        projectDetailsPage.getYesOnPopUp().click()
        cy.batchActionVerifyNotificationAndClose()
        cy.checkEPLStatus(expertData.originalName, 'Requested')
    })

    it('should move segment', function () {
        cy.wait(500)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        cy.wait('@getProjectSegment').its('response.statusCode').should('equal', 200)
        projectDetailsPage.getAddSegmentBtn().click({ force: true })
        projectDetailsPage.getSegmentName().type('Electrical Equipment')
        projectDetailsPage.submitButton().click()
        cy.wait('@waitForAddSegment').its('response.statusCode').should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        projectDetailsPage.getFirstSegmentCheckbox().click()
        globalPage.getActionButtonByName('Batch actions').click()
        projectDetailsPage.getAssignToSegmentRadioBtn().click()
        projectDetailsPage.selectSegment('Electrical Equipment')
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        projectDetailsPage.getBatchActionMessage().should('contain.text', 'Are you sure you want to update segment for selected EPLs?')
        projectDetailsPage.getYesOnPopUp().click()
        cy.batchActionVerifyNotificationAndClose()
        projectDetailsPage.getEmptySegment().should('exist')
        projectDetailsPage.getHeadingOfEmptySegment().should('contain.text', 'Heavy Machinary (0 / 5)')
        projectDetailsPage.getHeadingForSegmentWithExpert().should('contain.text', 'Electrical Equipment (1 / 5)')
        projectDetailsPage.getSegmentWithExpert().should('exist')
    })
})

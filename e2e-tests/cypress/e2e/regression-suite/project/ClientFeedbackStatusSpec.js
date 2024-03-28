import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'

describe('Check different client feedback status under project details as Team Leader', { tags: "regression" }, function () {
    let authInfo,
        projectId
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const globalPage = new GlobalPage()
    const projectDetailsPage = new ProjectDetailsPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.teamLeader.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authInfo = loginResponse
            })
        })
        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
            })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    })

    it('should show client feedback status as Send', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        cy.waitForLoadingDisappear()
        projectDetailsPage.getClientFeedbackText().should('have.text', 'Client feedback status:')
        projectDetailsPage.getClientFeedbackSendOption().should('have.text', 'Send')
    })

    it('should successfully send client feedback mail', function () {

        // running API to close project
        cy.fixture('projectDetails').then(projectDetails => {
            cy.requestClientContacts(authInfo.body.token, projectId).then(
                clientContactsResponse => {
            projectDetails.closeProject.clientContactIds[0] = clientContactsResponse.body[0].client.userId
            cy.changeProjectStatusRequest(authInfo.body.token, projectId, projectDetails.closeProject)
         })
         })


        // Clicking on send feedback button
        projectDetailsPage.getClientFeedbackSendOption().should('be.visible').click()

        // Verifying responses after clicking 'Send button'
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Feedback sent')
        projectDetailsPage.getClientFeedbackSentText().should('have.text', 'Sent')
    })

    it('should successfully resent client feedback mail', function () {
        projectDetailsPage.getClientFeedbackResentBtn().should('be.visible').should('have.text', 'Resend')
        projectDetailsPage.getClientFeedbackResentBtn().click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().first().should('have.text', 'Feedback sent')

    })
    it('should add client feedback', function () {

        // Generated feedback link from API
        cy.requestFeedbackLink(authInfo.body.token, projectId).then(responseURL => {

            // Visiting feedback link
            cy.visit(responseURL)
        })

        //Adding FeedBack with ratting and Comment
        projectDetailsPage.addFeedBack('1', '10', 'Test feedback 1')
        projectDetailsPage.addFeedBack('2', '9', 'Test feedback 2')
        projectDetailsPage.addFeedBack('3', '8', 'Test feedback 3')
        projectDetailsPage.addFeedBack('4', '10', 'Test feedback 4')
        projectDetailsPage.getFeedbackButton().click()
        
        // Verifying whether feedback is added
        projectDetailsPage.getFeedbackVerification().should('have.text', 'Thank you!')
    })

    it('should verify given client feedback', function () {

        // visiting project's page again
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        cy.waitForLoadingDisappear()
        projectDetailsPage.getClientFeedbackText().should('have.text', 'Client feedback status:')
        projectDetailsPage.getClientRating().should('have.text', '9.25').click()

        // Verifying given feedback here
        projectDetailsPage.getGivenFeedback().eq(0).should('have.text', '10.00')
        projectDetailsPage.getGivenFeedback().eq(1).should('have.text', '9.00')
        projectDetailsPage.getGivenFeedback().eq(2).should('have.text', '8.00')
        projectDetailsPage.getGivenFeedback().eq(3).should('have.text', '10.00')

        // Closing feedback with popup after verification
        globalPage.getButtonByName('Close').click()
    })

})

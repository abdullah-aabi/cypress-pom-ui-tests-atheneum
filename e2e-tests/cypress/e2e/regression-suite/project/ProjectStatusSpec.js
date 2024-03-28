import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'

describe('Check different Project Status as Team Leader', { tags: "regression" }, function () {
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

    it('should show project status as Open', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectStatus().should('have.text', 'Open')
    })

    it('should show project status as Pending', function () {
        projectDetailsPage.selectPendingStatus()
            .should('be.visible').click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Project status updated')
        projectDetailsPage.getProjectStatus().should('have.text', 'Pending')
    })

    it('should show project status as Closed', function () {
        projectDetailsPage.selectClosedStatus()
            .should('be.visible').click()
        projectDetailsPage.inputClosingProjectComment()
            .should('be.visible').type('Closing Project')
        projectDetailsPage.submitButton()
            .should('be.visible').click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Project status updated')
        projectDetailsPage.getProjectStatus().should('have.text', 'Closed')
    })
})

import GlobalPage from '../../../pageObjects/GlobalPage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import generator from '../../../support/generator'
import EPLDetailsPage from '../../../pageObjects/EPLDetailsPage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'

describe('Team Leader sending follow up and invite to experts', { tags: "regression" }, function () {
    let expertFullName, authInfo, projectId, eplError

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const globalPage = new GlobalPage()
    const eplDetailsPage = new EPLDetailsPage()
    const expertPipelinePage = new ExpertPipelinPage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const scheduling = new AvailabilitiesAndScheduling()
    const expertInvitePage = new ExpertInvitePage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                cy.fixture('testUsers').then(testUsers => {
                    expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName
                        }`
                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)
                    cy.requestLogIn(
                        testUsers.teamLeader.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        authInfo = loginResponse
                    })
                })
            }
        )
        cy.fixture('eplErrors').then(eplErrors => {
            eplError = eplErrors
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.intercept('POST', '**/notify-expert').as('waitForNotifyExpert')
        cy.intercept('POST', '**/notify-clients').as('waitForNotifyClient')
        cy.intercept('POST', '**/api/project/**/zoom-meetings').as('waitForZoomMeeting')
        cy.intercept('GET', '**/api/expert/typeahead-search?**').as('waitForGetExpert')
        cy.intercept('PUT', '**/api/expert-project-link/**').as('waitForEPLUpdate')
        cy.intercept('GET', '**/translate?**').as('waitForScheduleTool')
    })

    it('should show screening field missing warning when EPL status is Submitted', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        eplDetailsPage.getExpertName().click()
        eplDetailsPage.getScreeningFieldText().clear()
        eplDetailsPage.getSaveBtn().click()
        cy.changeEPLStatus(expertFullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.verifyNotificationAndClose()
        cy.checkEPLStatus(expertFullName, 'Submitted')
        eplDetailsPage.getScreeningMissingErrorMsg().should('have.text', eplError.screeningWariningMessage)
    })

    it('should show screening field missing warning when EPL status is Scheduled', function () {
        expertInvitePage.getSchedulingToolButton().click()
        cy.wait('@waitForScheduleTool')
            .its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        fasterSchedulingPage.getZoomCreationQuickButton().should('exist').click({ force: true })
        fasterSchedulingPage.getConfirmSlotButton().should('be.visible').click()
        globalPage.getNotificationTitle().first().should('contain.text', 'Success!')
        cy.wait('@waitForNotifyExpert').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForNotifyClient').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForZoomMeeting').its('response.statusCode').should('eq', 200)
        cy.checkEPLStatus(expertFullName, 'Scheduled')
        eplDetailsPage.getScreeningMissingErrorMsg().should('have.text', eplError.screeningWariningMessage)
    })

    it('should show screening field missing warning when EPL status is Interviewed', function () {
        cy.changeEPLStatus(expertFullName, 'Interviewed')
        scheduling.getConfirmInterviewButton().click()
        cy.wait('@waitForGetExpert').its('response.statusCode').should('eq', 200)
        scheduling.getCloseButton().click()
        cy.checkEPLStatus(expertFullName, 'Interviewed')
        eplDetailsPage.getScreeningMissingErrorMsg().first().should('have.text', eplError.screeningWariningMessage)
        eplDetailsPage.getScreeningMissingErrorMsg().last().should('have.text', eplError.honoAndFeeMissingMessage)
    })

    it('should show screening field missing warning when EPL status is Not Interviewed', function () {
        cy.changeEPLStatus(expertFullName, 'Not interviewed')
        fasterSchedulingPage.getCancelOptionsDropdownOnScheduleOverview().should('be.visible').click()
        fasterSchedulingPage.getOneCancelOptionOnScheduleOverview().should('be.visible').click()
        fasterSchedulingPage.getConfirmationButtonOnScheduleOverview().should('be.visible').click()
        cy.wait('@waitForEPLUpdate').its('response.statusCode').should('eq', 200)
        expertInvitePage.getEPLStatusDropdown().should('be.visible').contains('Not interviewed')
        eplDetailsPage.getScreeningMissingErrorMsg().should('have.text', eplError.screeningWariningMessage)
    })

})

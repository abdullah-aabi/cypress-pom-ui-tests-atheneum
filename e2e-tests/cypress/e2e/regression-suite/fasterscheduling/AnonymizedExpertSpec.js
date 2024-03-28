import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'

describe('Check if expert is hidden in client invite', { tags: "specs_not_yet_released" }, function () {
    let testUsers,
        projectId,
        projectDetails,
        localStorage

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const expertPipelinePage = new ExpertPipelinePage()
    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
        })
        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('projectDetails').then(projectDetailsFixture => {
                    projectDetails = projectDetailsFixture
                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        localStorage = quickLoginResponse.body

                        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                            expertCreateObject.firstName = expertData.firstName
                            expertCreateObject.lastName = expertData.lastName
                            expertCreateObject.originalName = expertData.originalName
                            expertCreateObject.email = expertData.email
                            cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                                expertCreateResponse => {
                                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
                                }
                            )
                        })

                        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

                        cy.visit(
                            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                        )
                        expertInvitePage.getExpertsPipelineButton().click()
                    })
                    cy.clickEplExpertToExpand(expertData.originalName)
                    expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
                    cy.verifyNotificationAndClose()
                    expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
                    expertPipelinePage
                        .getIconForFeeDescription()
                        .should('be.visible')
                        .click()
                    cy.verifyNotificationAndClose()
                    cy.changeEPLStatus(expertData.originalName, 'Submitted')
                    expertPipelinePage.getEplStatusConfirmButton().click()
                    cy.verifyNotificationAndClose()
                    cy.checkEPLStatus(expertData.originalName, 'Submitted')
                })
            })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('GET', '**/translate?**').as('waitForScheduleTool')
        cy.intercept('POST', '**/api/project/**/zoom-meetings').as(
            'waitForZoomMeting')
    })

    it('Should Hide expert name in client Invite', function () {

        expertInvitePage
            .getSchedulingToolButton()
            .should('be.visible')
            .click()

        cy.wait('@waitForScheduleTool').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        fasterSchedulingPage
            .getZoomCreationQuickButton()
            .should('exist')
            .click({ force: true })

        fasterSchedulingPage.getAnonymizeExpert().click({force: true})
   
        fasterSchedulingPage.getQuickInviteModifyButton().click()
        fasterSchedulingPage.getClinetSubject('Topic').should('be.visible').invoke('attr', 'value')
            .then($el => {
                expect($el).not.to.include(expertData.originalName)
            })
        fasterSchedulingPage.getConfirmButton().click()
        fasterSchedulingPage.getExpertInviteModifyButton()
            .should('be.visible').click()
        fasterSchedulingPage.getClinetSubject('Subject').should('have.attr', 'value', 'Atheneum call')
        fasterSchedulingPage.getClinetSubject('Subject').should('be.visible').invoke('attr', 'value')
            .then($el => {
                expect($el).not.to.include(expertData.originalName)
            })
            fasterSchedulingPage.getMessageContentOnClientInvite()
            .should('be.visible')
            .then($el => {
                const text = $el.text()
                expect(text).not.to.include(expertData.originalName)
            })
            
        fasterSchedulingPage.getSendCalendarInvitation().click()
        fasterSchedulingPage.getClientInviteModifyButton()
            .should('be.visible').click()
        fasterSchedulingPage.getClinetSubject('Subject').should('have.attr', 'value', 'Atheneum call')
        fasterSchedulingPage.getClinetSubject('Subject').should('be.visible').invoke('attr', 'value')
            .then($el => {
                expect($el).not.to.include(expertData.originalName)
            })
            fasterSchedulingPage.getMessageContentOnClientInvite()
            .should('be.visible')
            .then($el => {
                const text = $el.text()
                expect(text).not.to.include(expertData.originalName)
            })
            fasterSchedulingPage.getSendCalendarInvitation().click()
            fasterSchedulingPage.getConfirmSlotButton().click()

            expertInvitePage
            .getSchedulingToolButton()
            .should('be.visible')
            .click()

        cy.wait('@waitForScheduleTool').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        fasterSchedulingPage.getReschuleClientInviteModifyButton()
            .should('be.visible').click({force: true})
            fasterSchedulingPage.getClinetSubject('Subject').should('have.attr', 'value', 'Atheneum call')
        fasterSchedulingPage.getClinetSubject('Subject').should('be.visible').invoke('attr', 'value')
            .then($el => {
                expect($el).not.to.include(expertData.originalName)
            })
            fasterSchedulingPage.getMessageContentOnClientInvite()
            .should('be.visible')
            .then($el => {
                const text = $el.text()
                expect(text).not.to.include(expertData.originalName)
            })
    })
})
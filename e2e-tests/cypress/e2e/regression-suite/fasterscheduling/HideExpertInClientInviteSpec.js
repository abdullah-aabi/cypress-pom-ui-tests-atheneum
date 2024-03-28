import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
let expertDetails = require('../../../fixtures/expertDetails.json')

describe('Check if expert is hidden in client invite', { tags: "regression" }, function () {
    let testUsers,
        projectId,
        projectDetails,
        localStorage,
        eplId,
        segmentId,
        authToken,
        subjectLine

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const expertPipelinePage = new ExpertPipelinePage()
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

                cy.fixture('projectDetails').then(projectDetailsFixture => {
                    projectDetails = projectDetailsFixture

                    subjectLine = `${projectName} / ${projectDetails.segmentTitle} / ${expertDetails.experiences[2].position} / ${expertDetails.experiences[2].company} / ${(expertDetails.experiences[2].location).split(" ")[1]}`
                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        localStorage = quickLoginResponse.body
                        authToken = quickLoginResponse.body.token

                        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                            expertCreateObject.firstName = expertData.firstName
                            expertCreateObject.lastName = expertData.lastName
                            expertCreateObject.originalName = expertData.originalName
                            expertCreateObject.email = expertData.email
                            cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                                expertCreateResponse => {
                                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                                        addAndInviteExpertToProjectFromAPIResponse => {
                                            eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                                            segmentId = projectCreateResponse.body.segmentId

                                            // Add Fee and hono
                                            cy.fixture('objects/eplExpandedObject').then(eplRequestData => {
                                                eplRequestData.segmentId = segmentId
                                                eplRequestData.honorarium = projectDetails.honorariumAmount
                                                eplRequestData.fee = projectDetails.feeAmountField
                                                cy.requestPutEPLExpanded(authToken, eplId, eplRequestData)

                                                // Change EPL to submitted 
                                                cy.requestGetEPL(authToken, eplId).then(eplRequestDataResponse => {
                                                    eplRequestDataResponse.body.eplStatusId = 5
                                                    eplRequestDataResponse.body.relevantExperience.experience.company = eplRequestDataResponse.body.relevantExperience.experience.company.name
                                                    eplRequestDataResponse.body.relevantExperience.experience.position = eplRequestDataResponse.body.relevantExperience.experience.position.name
                                                    cy.requestPutEPL(authToken, eplId, eplRequestDataResponse.body)

                                                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                                                    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
                                                    expertInvitePage.getExpertsPipelineButton().click()
                                                })
                                            })
                                        })
                                })
                        })
                    })
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
        cy.waitForLoadingDisappear()
        expertPipelinePage.getEyeIcon()
            .should('be.visible')
            .click()

        globalPage.getNotificationTitle()
            .should('be.visible')
            .should('have.text', 'Success!')

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

        fasterSchedulingPage.getQuickInviteModifyButton().click()
        fasterSchedulingPage.getClinetSubject('Topic').should('be.visible').invoke('attr', 'value')
            .then($el => {
                expect($el).not.to.include(expertData.originalName)
            })
        fasterSchedulingPage.getConfirmButton().click()
        fasterSchedulingPage.getExpertInviteModifyButton()
            .should('be.visible').click()

        fasterSchedulingPage.getClinetSubject('Subject').should('have.attr', 'value', subjectLine)
        fasterSchedulingPage.getClinetSubject('Subject').should('be.visible').invoke('attr', 'value')
            .then($el => {
                expect($el).not.to.include(expertData.originalName)
            })

        fasterSchedulingPage.getSendCalendarInvitation().click()
        fasterSchedulingPage.getClientInviteModifyButton()
            .should('be.visible').click()
        fasterSchedulingPage.getClinetSubject('Subject').should('have.attr', 'value', subjectLine)

        fasterSchedulingPage.getMessageContentOnClientInvite()
            .should('be.visible')
            .then($el => {
                const text = $el.text()
                expect(text).not.to.include(expertData.originalName)
            })
        fasterSchedulingPage.getClinetSubject('Subject').should('have.attr', 'value', subjectLine)
        fasterSchedulingPage.sendCalenderInviteButton()
            .should('be.visible').click()

        fasterSchedulingPage
            .getConfirmSlotButton()
            .should('be.visible')
            .click()

        cy.waitForLoadingDisappear()
        cy.waitForLoadingDisappear()

        expertInvitePage
            .getSchedulingToolButton()
            .should('be.visible')
            .click()

        cy.wait('@waitForZoomMeting').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        cy.wait(1000)
        fasterSchedulingPage.getClientInviteModifyOnOverview()
            .should('be.visible')
            .click({ force: true })

        fasterSchedulingPage.getMessageContentOnClientInvite()
            .should('be.visible')
            .then($el => {
                const text = $el.text()
                expect(text).not.to.include(expertData.originalName)
            })

        fasterSchedulingPage.sendCalenderInviteButton()
            .should('be.visible').click()

        fasterSchedulingPage
            .getCancelIconInScheduleOverview()
            .should('be.visible')
            .click()

        fasterSchedulingPage
            .getCancelOptionsDropdownOnScheduleOverview()
            .should('be.visible')
            .click()

        fasterSchedulingPage
            .getOneCancelOptionOnScheduleOverview()
            .should('be.visible')
            .click()

        fasterSchedulingPage
            .getConfirmationButtonOnScheduleOverview()
            .should('be.visible')
            .click()

        expertInvitePage
            .getEPLStatusDropdown()
            .should('be.visible')
            .contains('Not interviewed')
    })
})

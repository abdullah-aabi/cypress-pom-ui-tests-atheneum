import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'

describe('Schedule Type None', { tags: "regression" }, function () {
    let testUsers,
        projectId,
        localStorage,
        expertStartTime,
        expertEndTime,
        startTimeForOps,
        textOfUpdatedZoom,
        rescheduleDate,
        eplId,
        segmentId,
        authToken,
        projectDetails

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

                cy.requestLogIn(
                    testUsers.accountManager.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    localStorage = quickLoginResponse.body
                    authToken = quickLoginResponse.body.token
                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                    cy.fixture('projectDetails').then(projectDetailsFixture => {
                        projectDetails = projectDetailsFixture

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
                                }
                            )
                        })
                    })

                    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
                    expertInvitePage.getExpertsPipelineButton().click()
                    cy.waitForLoadingDisappear()
                })
            }
        )
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('Should schedule by selecting type as None', function () {
        expertInvitePage.getSchedulingToolButton().should('be.visible').click()
        cy.waitForLoadingDisappear()

        fasterSchedulingPage.selectTypeNoneForScheduling()
        cy.waitForLoadingDisappear()

        fasterSchedulingPage.getExpertTimeForSchedule().then($el => {
            const scheduleTimeForExpert = $el.text()
            expertStartTime = scheduleTimeForExpert.substring(0, 6)
        })

        fasterSchedulingPage.getExpertTimeForSchedule().then($el => {
            const scheduleTimeForExpert = $el.text()
            expertEndTime = scheduleTimeForExpert.substring(9, 14)
        })

        fasterSchedulingPage.getScheduleTimeForOpsTimeZone().then($el => {
            const scheduleTimeForExpert = $el.text()
            startTimeForOps = scheduleTimeForExpert.substring(0, 5)
        })


        fasterSchedulingPage.getExpertInviteForNone().should('be.visible').click({ force: true })
        fasterSchedulingPage.getTimeInExpertInvite().should('be.visible')
            .then($el => {
                const uneditableExpertInviteText = $el.text()
                expect(uneditableExpertInviteText).to.include(expertStartTime)
                expect(uneditableExpertInviteText).to.include(expertEndTime)
            })

        fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()

        fasterSchedulingPage
            .getConfirmButtonForNone()
            .should('be.visible')
            .click()

        cy.waitForLoadingDisappear()

        expertInvitePage
            .getTimeOnEpl()
            .should('be.visible')
            .then($el => {
                const timeOnEpl = $el.text().trim()
                expect(timeOnEpl).to.include(startTimeForOps)
            })

    })

    it('Should reschedule slot for type None', function () {
        expertInvitePage.getSchedulingToolButton().should('be.visible').click()
        cy.waitForLoadingDisappear()

        fasterSchedulingPage.getScheduledStartTime().should('be.visible').click()
        fasterSchedulingPage.getNextDayButton().should('be.visible').click()

        fasterSchedulingPage.getZoomInfoOnScheduledOverview()
            .then($el => {
                textOfUpdatedZoom = $el.text()
                rescheduleDate = textOfUpdatedZoom.substring(18, 24)
            })

        fasterSchedulingPage
            .getConfirmButtonForNone()
            .should('be.visible')
            .click()

        cy.waitForLoadingDisappear()

        expertInvitePage
            .getDateOnEpl()
            .should('be.visible')
            .then($el => {
                const dateOnEpl = $el.text().trim()
                expect(dateOnEpl).to.include(rescheduleDate)
            })
    })

    it('Should cancel scheduled slot for type None', function () {

        expertInvitePage.getSchedulingToolButton().should('be.visible').click()
        cy.waitForLoadingDisappear()

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

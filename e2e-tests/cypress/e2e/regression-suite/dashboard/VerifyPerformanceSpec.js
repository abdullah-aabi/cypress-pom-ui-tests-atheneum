/// <reference types="Cypress" />

import generator from '../../../support/generator'
import DashboardPage from '../../../pageObjects/DashboardPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
const getCurrentMonthYear = generator.generateCurrentMonthYear()

describe('Verify Performance  widget details', { tags: "regression" }, function () {
    let testUsers, authToken, teamName, testData, projectId, projectDetails
    let totalDvBefore = 0
    let totalDvAfter = 0
    let totalIvBefore = 0
    let totalIvAfter = 0
    let MytotalIvBefore = 0
    let MytotalIvAfter = 0
    let MytotalDvBefore = 0
    let MytotalDvAfter = 0
    let teamTotalDvBefore = 0
    let teamTotalDvAfter = 0
    let teamTotalIvBefore = 0
    let teamTotalIvAfter = 0

    let expertData = generator.generateExpertNames(1)[0]

    const dashboardPage = new DashboardPage()
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const globalPage = new GlobalPage()
    const scheduling = new AvailabilitiesAndScheduling()
    const expertPipelinePage = new ExpertPipelinePage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.dashboardAccountManager.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                cy.setLocalStorageLoginInfo(
                    loginResponse.body.user,
                    loginResponse.body.token
                )
                authToken = loginResponse.body.token

                cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                    expertCreateObject.firstName = expertData.firstName
                    expertCreateObject.lastName = expertData.lastName
                    expertCreateObject.originalName = expertData.originalName
                    expertCreateObject.email = expertData.email
                    cy.requestCreateExpert(authToken, expertCreateObject).then(
                        expertCreateResponse => {
                            expertData.expertId = expertCreateResponse.body.id
                        }
                    )
                })
            })
        })
        cy.fixture('testData').then(testdata => {
            testData = testdata
        })
        cy.fixture('projectDetails').then(projectDetailsFixture => {
            projectDetails = projectDetailsFixture
        })
    })

    it('Verify Performance widget details', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()

        // Get Data before creating new bundle
        cy.requestGetPerformanceWidgetData(authToken, getCurrentMonthYear)
            .then(getPerformanceWidgetResponse => {

                //Team Name
                dashboardPage.getTeamNameInPerformanceWidget()
                    .should('be.visible')
                    .then($el => {
                        teamName = $el.text()
                        expect(teamName).to.include(getPerformanceWidgetResponse.body.teamName)
                        expect(teamName).to.include(testData.dashboardTeamName)
                    })

                // Team Dvs
                dashboardPage.getTeamDvInPerformanceWidget(2)
                    .should('be.visible')
                    .then($el => {
                        teamTotalDvBefore = parseInt($el.text())
                    })

                // Team Ivs
                dashboardPage.getTeamDvInPerformanceWidget(3)
                    .should('be.visible')
                    .then($el => {
                        teamTotalIvBefore = parseInt($el.text())
                    })

                // DvBy me Dvs
                dashboardPage.getDelieveredByMeDvs(2)
                    .should('be.visible')
                    .then($el => {
                        totalDvBefore = parseInt($el.text())
                    })

                // DvBy me Invs
                dashboardPage.getDelieveredByMeDvs(3)
                    .should('be.visible')
                    .then($el => {
                        totalIvBefore = parseInt($el.text())
                    })

                // My Total Dvs
                dashboardPage.getTotalDvs(2)
                    .should('be.visible')
                    .then($el => {
                        MytotalDvBefore = parseInt($el.text())
                    })

                // My Total Invs
                dashboardPage.getTotalDvs(3)
                    .should('be.visible')
                    .then($el => {
                        MytotalIvBefore = parseInt($el.text())
                    })
            })

        // create test data 
        cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.dashboardAccountManager.emailAddress, testData.dashboardOfficeName).then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.addAndInviteExpertToProjectFromAPI(projectId, expertData.expertId).then(
                    addAndInviteExpertToProjectFromAPIResponse => {
                        cy.log(addAndInviteExpertToProjectFromAPIResponse)
                    })

                cy.visit(
                    `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                )
                expertInvitePage.getExpertsPipelineButton().click()

                cy.wait(500)
                cy.changeEPLStatus(expertData.originalName, 'Submitted')
                expertPipelinePage.getEplStatusConfirmButton().click()
                cy.verifyNotificationAndClose()
                cy.checkEPLStatus(expertData.originalName, 'Submitted')

                cy.clickEplExpertToExpand(expertData.originalName)
                expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)

                cy.verifyNotificationAndClose()
                expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)

                expertPipelinePage
                    .getIconForFeeDescription()
                    .should('be.visible')
                    .click()
                cy.verifyNotificationAndClose()
                expertPipelinePage.getDelieveredByField()
                    .scrollIntoView()
                    .click()
                    .clear()
                    .type(`${testUsers.dashboardTeamLeader.firstName} ${testUsers.dashboardTeamLeader.lastName}`)
                globalPage.selectAsPerEnteredText(`${testUsers.dashboardTeamLeader.firstName} ${testUsers.dashboardTeamLeader.lastName}`)
                cy.verifyNotificationAndClose()

                cy.changeEPLStatus(expertData.originalName, 'Scheduled')

                cy.waitForLoadingDisappear()

                fasterSchedulingPage
                    .getConfirmSlotButton()
                    .should('be.visible')
                    .click()
                cy.waitForLoadingDisappear()
                cy.checkEPLStatus(expertData.originalName, 'Scheduled')

                expertInvitePage
                    .getExpertsPipelineButton()
                    .scrollIntoView()
                    .click()
                cy.changeEPLStatus(expertData.originalName, 'Interviewed')
                scheduling.getConfirmInterviewButton().click()
                scheduling
                    .getCurrencyTypeFieldList()
                    .first()
                    .should('have.text', projectDetails.feeCurrency)
                scheduling
                    .getInterviewDurationField()
                    .should('have.value', projectDetails.interviewDuration)
                scheduling
                    .getFeeValueAmountOnBundle()
                    .should('have.value', projectDetails.feeAmountField)
                scheduling.getHonorariumExpertName().should('have.value', expertData.originalName)
                scheduling
                    .getCurrencyTypeFieldList()
                    .last()
                    .should('have.text', projectDetails.honorariumCurrency)
                scheduling
                    .getHonorariumCostValue()
                    .should('have.value', projectDetails.honorariumAmount)
                scheduling.getConfirmInterviewButton().click()

                globalPage.getNotificationTitle().should('have.text', 'Saved')
                globalPage
                    .getNotificationMessage()
                    .first()
                    .should('contain.text', 'Hon. & Fee Bundle succeeded.')

                cy.checkEPLStatus(expertData.originalName, 'Interviewed')
                cy.verifyExpertReplyStatus(expertData.originalName, 'Confirmed')
            })

        // Verify newly added test data 
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()

        cy.requestGetPerformanceWidgetData(authToken, getCurrentMonthYear)
            .then(getPerformanceWidgetResponse => {

                //Team Name
                dashboardPage.getTeamNameInPerformanceWidget()
                    .should('be.visible')
                    .then($el => {
                        teamName = $el.text()
                        expect(teamName).to.include(getPerformanceWidgetResponse.body.teamName)
                        expect(teamName).to.include(testData.dashboardTeamName)
                    })

                // Team Dvs
                dashboardPage.getTeamDvInPerformanceWidget(2)
                    .should('be.visible')
                    .then($el => {
                        teamTotalDvAfter = parseInt($el.text())
                        expect(teamTotalDvAfter).to.eq(getPerformanceWidgetResponse.body.teamDeliveries)
                        expect(teamTotalDvAfter).to.eq(teamTotalDvBefore + 1)
                    })

                // Team Ivs
                dashboardPage.getTeamDvInPerformanceWidget(3)
                    .should('be.visible')
                    .then($el => {
                        teamTotalIvAfter = parseInt($el.text())
                        expect(teamTotalIvAfter).to.eq(getPerformanceWidgetResponse.body.teamInterviews)
                        expect(teamTotalIvAfter).to.eq(teamTotalIvBefore + 1)
                    })

                // DvBy me Dvs
                dashboardPage.getDelieveredByMeDvs(2)
                    .should('be.visible')
                    .then($el => {
                        totalDvAfter = parseInt($el.text())
                        expect(totalDvAfter).to.eq(getPerformanceWidgetResponse.body.employeeDeliveries)
                        expect(totalDvAfter).to.eq(totalDvBefore)
                    })

                // DvBy me Invs
                dashboardPage.getDelieveredByMeDvs(3)
                    .should('be.visible')
                    .then($el => {
                        totalIvAfter = parseInt($el.text())
                        expect(totalIvAfter).to.eq(getPerformanceWidgetResponse.body.employeeInterviews)
                        expect(totalIvAfter).to.eq(totalIvBefore)
                    })

                // My Total Dvs
                dashboardPage.getTotalDvs(2)
                    .should('be.visible')
                    .then($el => {
                        MytotalDvAfter = parseInt($el.text())
                        expect(MytotalDvAfter).to.eq(getPerformanceWidgetResponse.body.employeeDeliveries +
                            getPerformanceWidgetResponse.body.accountManagerDeliveries +
                            getPerformanceWidgetResponse.body.teamLeaderDeliveries)
                        expect(MytotalDvAfter).to.eq(MytotalDvBefore + 1)
                    })

                // My Total Invs
                dashboardPage.getTotalDvs(3)
                    .should('be.visible')
                    .then($el => {
                        MytotalIvAfter = parseInt($el.text())
                        expect(MytotalIvAfter).to.eq(getPerformanceWidgetResponse.body.employeeInterviews +
                            getPerformanceWidgetResponse.body.accountManagerInterviews +
                            getPerformanceWidgetResponse.body.teamLeaderInterviews)
                        expect(MytotalIvAfter).to.eq(MytotalIvBefore + 1)
                    })
            })



    })
})
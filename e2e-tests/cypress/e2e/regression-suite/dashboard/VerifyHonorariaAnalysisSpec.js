/// <reference types="Cypress" />

import generator from '../../../support/generator'
import DashboardPage from '../../../pageObjects/DashboardPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
const getCurrentMonthYear = generator.generateCurrentMonthYear()

describe('Verify Honoraria  widget details', { tags: "regression" }, function () {
    let testUsers, authToken, teamName, count, testData, projectDetails, textForAvgTL,
        textForAvgAS, textForDiffTL, textForDiffAS, projectId, averageForTL, totalCost,
        totalInterviewed

    let avgBeforeForTL = 0
    let avgAfterForTL = 0
    let avgBeforeForAS = 0
    let avgAfterForAS = 0

    let expertData = generator.generateExpertNames(1)[0]

    const dashboardPage = new DashboardPage()
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const globalPage = new GlobalPage()
    const scheduling = new AvailabilitiesAndScheduling()
    const expertPipelinePage = new ExpertPipelinePage()

    before(function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/login`).as('loginRequest')
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

    it('Verify Honoraria widget details', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()

        cy.requestGetHonorariaWidgetData(authToken, getCurrentMonthYear)
            .then(getHonorariaWidgetResponse => {
                count = Object.keys(getHonorariaWidgetResponse.body.teamMembers).length
                if (count > 0) {
                    dashboardPage.getTotalCountOfEmployeeInHonoWidget()
                        .its('length')
                        .should('eq', count)

                    // Team Name
                    dashboardPage.getTeamNameInHonoWidget()
                        .should('be.visible')
                        .then($el => {
                            teamName = $el.text()
                            expect(teamName).to.include(getHonorariaWidgetResponse.body.teamName)
                            expect(teamName).to.include(testData.dashboardTeamName)
                        })

                    // Name of employee
                    dashboardPage.getColmnInHonoWidget(1, 1)
                        .should('be.visible')
                        .then($empName => {
                            const name = $empName.text().trim()
                            expect(name).to.eq(`${testUsers.dashboardTeamLeader.firstName} ${testUsers.dashboardTeamLeader.lastName}`)
                        })
                    // Position of employee
                    dashboardPage.getColmnInHonoWidget(1, 2)
                        .should('be.visible')
                        .then($empPosition => {
                            const position = $empPosition.text()
                            expect(position).to.eq(`${testUsers.dashboardTeamLeader.position}`)
                        })

                    // Avg of employee
                    dashboardPage.getColmnInHonoWidget(1, 3)
                        .should('be.visible')
                        .then($empAvg => {
                            textForAvgTL = $empAvg.text()
                            if (textForAvgTL === '-') {
                                avgBeforeForTL = 0
                            } else {
                                textForAvgTL = textForAvgTL.split(',').join('')
                                avgBeforeForTL = parseInt(textForAvgTL)
                            }
                        })


                    // Name of employee
                    dashboardPage.getColmnInHonoWidget(2, 1)
                        .should('be.visible')
                        .then($empName => {
                            const name = $empName.text().trim()
                            expect(name).to.eq(`${testUsers.dashboardAssociate.firstName} ${testUsers.dashboardAssociate.lastName}`)
                        })
                    // Position of employee
                    dashboardPage.getColmnInHonoWidget(2, 2)
                        .should('be.visible')
                        .then($empPosition => {
                            const position = $empPosition.text()
                            expect(position).to.eq(`${testUsers.dashboardAssociate.position}`)
                        })

                    // Avg of employee
                    dashboardPage.getColmnInHonoWidget(2, 3)
                        .should('be.visible')
                        .then($empAvg => {
                            textForAvgAS = $empAvg.text()
                            if (textForAvgAS === '-') {
                                avgBeforeForAS = 0
                            } else {
                                textForAvgAS = textForAvgAS.split(',').join('')
                                avgBeforeForAS = parseInt(textForAvgAS)
                            }
                        })

                    // Diff of employee
                    dashboardPage.getColmnInHonoWidget(1, 4)
                        .should('be.visible')
                        .then($empDiff => {
                            textForDiffTL = $empDiff.text()
                            textForDiffTL = textForDiffTL.split(',').join('')

                            if (avgBeforeForTL !== 0 && avgBeforeForAS !== 0) {
                                expect(parseInt(textForDiffTL)).to.eq(Math.round(((avgBeforeForTL - ((avgBeforeForTL + avgBeforeForAS) / 2)) / ((avgBeforeForTL + avgBeforeForAS) / 2)) * 100))
                            }
                            else {
                                expect(parseInt(textForDiffTL)).to.eq(0)
                            }
                        })

                    // Diff of employee
                    dashboardPage.getColmnInHonoWidget(2, 4)
                        .should('be.visible')
                        .then($empDiff => {
                            textForDiffAS = $empDiff.text()
                            textForDiffAS = textForDiffAS.split(',').join('')
                            if (avgBeforeForTL !== 0 && avgBeforeForAS !== 0) {
                                expect(parseInt(textForDiffAS)).to.eq(Math.round(((avgBeforeForAS - ((avgBeforeForTL + avgBeforeForAS) / 2)) / ((avgBeforeForTL + avgBeforeForAS) / 2)) * 100))
                            }
                            else {
                                expect(parseInt(textForDiffAS)).to.eq(0)
                            }
                        })
                }
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

        // Verify newly created test data
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()

        cy.requestGetHonorariaWidgetData(authToken, getCurrentMonthYear)
            .then(getHonorariaWidgetResponse => {
                count = Object.keys(getHonorariaWidgetResponse.body.teamMembers).length
                if (count > 0) {
                    dashboardPage.getTotalCountOfEmployeeInHonoWidget()
                        .its('length')
                        .should('eq', count)

                    // Team Name
                    dashboardPage.getTeamNameInHonoWidget()
                        .should('be.visible')
                        .then($el => {
                            teamName = $el.text()
                            expect(teamName).to.include(getHonorariaWidgetResponse.body.teamName)
                            expect(teamName).to.include(testData.dashboardTeamName)
                        })

                    // Name of employee
                    dashboardPage.getColmnInHonoWidget(1, 1)
                        .should('be.visible')
                        .then($empName => {
                            const name = $empName.text().trim()
                            expect(name).to.eq(`${testUsers.dashboardTeamLeader.firstName} ${testUsers.dashboardTeamLeader.lastName}`)
                        })
                    // Position of employee
                    dashboardPage.getColmnInHonoWidget(1, 2)
                        .should('be.visible')
                        .then($empPosition => {
                            const position = $empPosition.text()
                            expect(position).to.eq(`${testUsers.dashboardTeamLeader.position}`)
                        })

                    // Avg of employee
                    dashboardPage.getColmnInHonoWidget(1, 3)
                        .should('be.visible')
                        .then($empAvg => {
                            textForAvgTL = $empAvg.text()
                            if (textForAvgTL === '-') {
                                avgAfterForTL = 0
                            } else {
                                textForAvgTL = textForAvgTL.split(',').join('')
                                avgAfterForTL = parseInt(textForAvgTL)
                                averageForTL = getHonorariaWidgetResponse.body.teamMembers.filter(
                                    averageForTL => averageForTL.position === 'Team Leader'
                                )[0].average

                                cy.requestGetTeamRevenueWidgetData(authToken, getCurrentMonthYear).then(teamRevenueDataResponse => {
                                    totalCost = teamRevenueDataResponse.body.teamMembers.filter(
                                        totalCost => totalCost.position === 'Team Leader'
                                    )[0].cost


                                    totalInterviewed = teamRevenueDataResponse.body.teamMembers.filter(
                                        totalInterviewed => totalInterviewed.position === 'Team Leader'
                                    )[0].interviewCount

                                    if (avgBeforeForTL === 0) {
                                        expect(avgAfterForTL).to.eq(Math.round(projectDetails.honorariumAmount))
                                        expect(avgAfterForTL).to.eq(Math.round(averageForTL / 1000000))
                                    }
                                    else {
                                        expect(avgAfterForTL).to.eq(Math.round(averageForTL / 1000000))
                                        expect(avgAfterForTL).to.eq(Math.round((totalCost / totalInterviewed) / 1000000))
                                    }
                                })
                            }
                        })


                    // Name of employee
                    dashboardPage.getColmnInHonoWidget(2, 1)
                        .should('be.visible')
                        .then($empName => {
                            const name = $empName.text().trim()
                            expect(name).to.eq(`${testUsers.dashboardAssociate.firstName} ${testUsers.dashboardAssociate.lastName}`)
                        })
                    // Position of employee
                    dashboardPage.getColmnInHonoWidget(2, 2)
                        .should('be.visible')
                        .then($empPosition => {
                            const position = $empPosition.text()
                            expect(position).to.eq(`${testUsers.dashboardAssociate.position}`)
                        })

                    // Avg of employee
                    dashboardPage.getColmnInHonoWidget(2, 3)
                        .should('be.visible')
                        .then($empAvg => {
                            textForAvgAS = $empAvg.text()
                            if (textForAvgAS === '-') {
                                avgAfterForAS = 0
                            } else {
                                textForAvgAS = textForAvgAS.split(',').join('')
                                avgAfterForAS = parseInt(textForAvgAS)
                                expect(avgAfterForAS).to.eq(Math.round((avgBeforeForAS + (projectDetails.honorariumAmount * (3600 / 3600))) / 2))
                            }
                        })

                    // Diff of employee
                    dashboardPage.getColmnInHonoWidget(1, 4)
                        .should('be.visible')
                        .then($empDiff => {
                            textForDiffTL = $empDiff.text()
                            textForDiffTL = textForDiffTL.split(',').join('')
                            if (avgAfterForTL !== 0 && avgAfterForAS !== 0) {
                                expect(parseInt(textForDiffTL)).to.eq(Math.round(((avgAfterForTL - ((avgAfterForTL + avgAfterForAS) / 2)) / ((avgAfterForTL + avgAfterForAS) / 2)) * 100))
                            }
                            else {
                                expect(parseInt(textForDiffTL)).to.eq(0)
                            }
                        })
                    // Diff of employee
                    dashboardPage.getColmnInHonoWidget(2, 4)
                        .should('be.visible')
                        .then($empDiff => {
                            textForDiffAS = $empDiff.text()
                            textForDiffAS = textForDiffAS.split(',').join('')
                            if (avgAfterForTL !== 0 && avgAfterForAS !== 0) {
                                expect(parseInt(textForDiffAS)).to.eq(Math.round(((avgAfterForAS - ((avgAfterForTL + avgAfterForAS) / 2)) / ((avgAfterForTL + avgAfterForAS) / 2)) * 100))
                            }
                            else {
                                expect(parseInt(textForDiffAS)).to.eq(0)
                            }
                        })
                }
            })

    })
})
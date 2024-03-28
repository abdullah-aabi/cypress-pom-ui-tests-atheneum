import generator from '../../../support/generator'
import DashboardPage from '../../../pageObjects/DashboardPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
const getCurrentYear = generator.generateCurrentYear()
const getCurrentMonthYear = generator.generateCurrentMonthYear()
const getCurrentQuarter = generator.generateCurrentQuarter()
const getCurrentMonth = generator.generateCurrentMonth()

describe('Verify Account Revenue widget details', { tags: "regression" }, function () {
    let testUsers, authToken, accountManagerName, countForAccountsMothly,

        esRevenueBefore, esRevenueAfter, ebrRevenueBefore, ebrRevenueAfter,
        surveyRevenueBefore, surveyRevenueAfter, EPRevenueBefore, EPRevenueAfter,
        textForESRevenue, textForEBRRevenue, textForSurveyRevenue, textForEPRevenue,
        firstMonthRevenue, secondMonthRevenue, thirdMonthRevenue, QuarterRevenue, QuarterlyTarget,
        achievement, testData, projectDetails, projectId, projectType

    let totalESRevenue = 0
    let totalEPRevenue = 0
    let totalEBRRevenue = 0
    let totalAccountRevenue = 0
    let totalSurveyRevenue = 0
    let totalAccountRevenueForQuarter = 0

    let expertData = generator.generateExpertNames(1)[0]

    const dashboardPage = new DashboardPage()
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const globalPage = new GlobalPage()
    const scheduling = new AvailabilitiesAndScheduling()
    const projectDetailsPage = new ProjectDetailsPage()
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

    it('Verify Account Revenue widget monthly', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()

        // Account Manager
        cy.requestGetAccountRevenueMonthlyWidgetData(authToken, getCurrentMonthYear)
            .then(getAccountRevenueMonthlyResponse => {

                countForAccountsMothly = Object.keys(getAccountRevenueMonthlyResponse.body.accounts).length
                if (countForAccountsMothly > 0) {
                    dashboardPage.getCountForMonthlyOnAccountRevenue()
                        .its('length')
                        .should('eq', countForAccountsMothly)

                    // ES Revenue
                    dashboardPage.getRevenue(1, 3)
                        .should('be.visible')
                        .then($revenue => {
                            textForESRevenue = $revenue.text()
                            if (textForESRevenue === '-') {
                                esRevenueBefore = 0
                            } else {
                                textForESRevenue = textForESRevenue.split(',').join('')
                                esRevenueBefore = parseInt(textForESRevenue)
                            }
                            totalESRevenue = totalESRevenue + parseInt(esRevenueBefore)
                        })

                    // EBR Revenue
                    dashboardPage.getRevenue(1, 4)
                        .should('be.visible')
                        .then($revenue => {
                            textForEBRRevenue = $revenue.text()
                            if (textForEBRRevenue === '-') {
                                ebrRevenueBefore = 0
                            } else {
                                textForEBRRevenue = textForEBRRevenue.split(',').join('')
                                ebrRevenueBefore = parseInt(textForEBRRevenue)
                            }
                            totalEBRRevenue = totalEBRRevenue + parseInt(ebrRevenueBefore)
                        })

                    // Survey Revenue
                    dashboardPage.getRevenue(1, 5)
                        .should('be.visible')
                        .then($revenue => {
                            textForSurveyRevenue = $revenue.text()
                            if (textForSurveyRevenue === '-') {
                                surveyRevenueBefore = 0
                            } else {
                                textForSurveyRevenue = textForSurveyRevenue.split(',').join('')
                                surveyRevenueBefore = parseInt(textForSurveyRevenue)
                            }
                            totalSurveyRevenue = totalSurveyRevenue + parseInt(surveyRevenueBefore)
                        })

                    // EP Revenue
                    dashboardPage.getRevenue(1, 6)
                        .should('be.visible')
                        .then($revenue => {
                            textForEPRevenue = $revenue.text()
                            if (textForEPRevenue === '-') {
                                EPRevenueBefore = 0
                            } else {
                                textForEPRevenue = textForEPRevenue.split(',').join('')
                                EPRevenueBefore = parseInt(textForEPRevenue)
                            }
                            totalEPRevenue = totalEPRevenue + parseInt(EPRevenueBefore)
                        })
                }
            })

        dashboardPage.getTotalOnAccountRevenue(3, 3)
            .should('be.visible')
            .then($el => {
                const resultESRevenue = $el.text()
                const resultESRevenueFormat = resultESRevenue.split(',').join('')
                expect(parseInt(resultESRevenueFormat)).to.eq(totalESRevenue)
            })

        dashboardPage.getTotalOnAccountRevenue(3, 4)
            .should('be.visible')
            .then($el => {
                const resultEBRRevenue = $el.text()
                const resultEBRRevenueFormat = resultEBRRevenue.split(',').join('')
                expect(parseInt(resultEBRRevenueFormat)).to.eq(totalEBRRevenue)
            })

        dashboardPage.getTotalOnAccountRevenue(3, 5)
            .should('be.visible')
            .then($el => {
                const resultESRevenue = $el.text()
                const resultESRevenueFormat = resultESRevenue.split(',').join('')
                expect(parseInt(resultESRevenueFormat)).to.eq(totalSurveyRevenue)
            })

        dashboardPage.getTotalOnAccountRevenue(3, 6)
            .should('be.visible')
            .then($el => {
                const resultEPRevenue = $el.text()
                const resultEPRevenueFormat = resultEPRevenue.split(',').join('')
                expect(parseInt(resultEPRevenueFormat)).to.eq(totalEPRevenue)
            })

        // Create test data 
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

                // adding to get Project type
                projectDetailsPage.getProjectDetailsRowValueByName('Type')
                    .then($projecttype => {
                        projectType = $projecttype.text()
                    })

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

        // Verfiy Account Revenue after data creation
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()

        cy.requestGetAccountRevenueMonthlyWidgetData(authToken, getCurrentMonthYear)
            .then(getAccountRevenueMonthlyResponse => {
                dashboardPage.getAMNameOnAccountRevenue()
                    .should('be.visible')
                    .then($el => {
                        accountManagerName = $el.text().trim()
                        expect(accountManagerName).to.include(getAccountRevenueMonthlyResponse.body.accountManager)
                        expect(accountManagerName).to.include(`${testUsers.dashboardAccountManager.firstName} ${testUsers.dashboardAccountManager.lastName}`)

                    })

                countForAccountsMothly = Object.keys(getAccountRevenueMonthlyResponse.body.accounts).length
                if (countForAccountsMothly > 0) {
                    dashboardPage.getCountForMonthlyOnAccountRevenue()
                        .its('length')
                        .should('eq', countForAccountsMothly)


                    // Name of Account
                    dashboardPage.getColumnForMonthlyOnAccountRevenue(1)
                        .should('be.visible')
                        .then($name => {
                            const accountName = $name.text()
                            expect(accountName).to.eq(testData.dashboardAccountName)
                        })

                    // ES Revenue
                    dashboardPage.getRevenue(1, 3)
                        .should('be.visible')
                        .then($revenue => {
                            textForESRevenue = $revenue.text()
                            if (textForESRevenue === '-') {
                                esRevenueAfter = 0
                                totalESRevenue = totalESRevenue + parseInt(esRevenueAfter)
                            } else if (projectType === 'Expert Sessions') {
                                textForESRevenue = textForESRevenue.split(',').join('')
                                esRevenueAfter = parseInt(textForESRevenue)
                                totalESRevenue = totalESRevenue + parseInt(projectDetails.feeAmountField)
                            } else {
                                textForESRevenue = textForESRevenue.split(',').join('')
                                esRevenueAfter = parseInt(textForESRevenue)
                            }
                            expect(esRevenueAfter).to.eq(totalESRevenue)
                            totalAccountRevenue = totalAccountRevenue + totalESRevenue
                        })

                    // EBR Revenue
                    dashboardPage.getRevenue(1, 4)
                        .should('be.visible')
                        .then($revenue => {
                            textForEBRRevenue = $revenue.text()
                            if (textForEBRRevenue === '-') {
                                ebrRevenueAfter = 0
                                totalEBRRevenue = totalEBRRevenue + parseInt(ebrRevenueAfter)
                            } else if (projectType === 'Expert-backed Research') {
                                textForEBRRevenue = textForEBRRevenue.split(',').join('')
                                ebrRevenueAfter = parseInt(ebrRevenueAfter)
                                totalEBRRevenue = totalEBRRevenue + parseInt(projectDetails.feeAmountField)
                            } else {
                                textForEBRRevenue = textForEBRRevenue.split(',').join('')
                                ebrRevenueAfter = parseInt(ebrRevenueAfter)
                            }
                            expect(ebrRevenueAfter).to.eq(totalEBRRevenue)
                            totalAccountRevenue = totalAccountRevenue + totalEBRRevenue
                        })

                    // Survey Revenue
                    dashboardPage.getRevenue(1, 5)
                        .should('be.visible')
                        .then($revenue => {
                            textForSurveyRevenue = $revenue.text()
                            if (textForSurveyRevenue === '-') {
                                surveyRevenueAfter = 0
                                totalSurveyRevenue = totalSurveyRevenue + parseInt(surveyRevenueAfter)
                            } else if (projectType === 'Expert Survey Research') {
                                textForSurveyRevenue = textForSurveyRevenue.split(',').join('')
                                surveyRevenueAfter = parseInt(textForSurveyRevenue)
                                totalSurveyRevenue = totalSurveyRevenue + parseInt(projectDetails.feeAmountField)
                            } else {
                                textForSurveyRevenue = textForSurveyRevenue.split(',').join('')
                                surveyRevenueAfter = parseInt(textForSurveyRevenue)
                            }
                            expect(surveyRevenueAfter).to.eq(totalSurveyRevenue)
                            totalAccountRevenue = totalAccountRevenue + totalSurveyRevenue
                        })

                    // EP Revenue
                    dashboardPage.getRevenue(1, 6)
                        .should('be.visible')
                        .then($revenue => {
                            textForEPRevenue = $revenue.text()
                            if (textForEPRevenue === '-') {
                                EPRevenueAfter = 0
                                totalEPRevenue = totalEPRevenue + parseInt(EPRevenueAfter)
                            } else if (projectType === 'Expert Placement') {
                                textForEPRevenue = textForEPRevenue.split(',').join('')
                                EPRevenueAfter = parseInt(textForEPRevenue)
                                totalEPRevenue = totalEPRevenue + parseInt(projectDetails.feeAmountField)
                            } else {
                                textForEPRevenue = textForEPRevenue.split(',').join('')
                                EPRevenueAfter = parseInt(textForEPRevenue)
                            }
                            expect(EPRevenueAfter).to.eq(totalEPRevenue)
                            totalAccountRevenue = totalAccountRevenue + totalEPRevenue
                        })
                }
            })
        dashboardPage.getTotalOnAccountRevenue(3, 3)
            .should('be.visible')
            .then($el => {
                const resultESRevenue = $el.text()
                const resultESRevenueFormat = resultESRevenue.split(',').join('')
                expect(parseInt(resultESRevenueFormat)).to.eq(totalESRevenue)
            })

        dashboardPage.getTotalOnAccountRevenue(3, 4)
            .should('be.visible')
            .then($el => {
                const resultEBRRevenue = $el.text()
                const resultEBRRevenueFormat = resultEBRRevenue.split(',').join('')
                expect(parseInt(resultEBRRevenueFormat)).to.eq(totalEBRRevenue)
            })

        dashboardPage.getTotalOnAccountRevenue(3, 5)
            .should('be.visible')
            .then($el => {
                const resultESRevenue = $el.text()
                const resultESRevenueFormat = resultESRevenue.split(',').join('')
                expect(parseInt(resultESRevenueFormat)).to.eq(totalSurveyRevenue)
            })

        dashboardPage.getTotalOnAccountRevenue(3, 6)
            .should('be.visible')
            .then($el => {
                const resultEPRevenue = $el.text()
                const resultEPRevenueFormat = resultEPRevenue.split(',').join('')
                expect(parseInt(resultEPRevenueFormat)).to.eq(totalEPRevenue)
            })


    })

    it('Verfify Account Revenue widget Quarterly', function () {
        dashboardPage.getQuarterlyButtonOnAccountRevenue()
            .should('be.visible')
            .click()

        cy.requestGetAccountRevenueQuarterlyWidgetData(authToken, getCurrentYear, getCurrentQuarter)
            .then(getAccountRevenueQuarterlyResponse => {
                if (getCurrentQuarter === 1) {
                    expect(getAccountRevenueQuarterlyResponse.body.months[0].month).to.eq('January')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(1)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[0].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[1].month).to.eq('February')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(2)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[1].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[2].month).to.eq('March')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(3)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[2].month)
                } else if (getCurrentQuarter === 2) {
                    expect(getAccountRevenueQuarterlyResponse.body.months[0].month).to.eq('April')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(1)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[0].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[1].month).to.eq('May')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(2)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[1].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[2].month).to.eq('June')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(3)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[2].month)
                } else if (getCurrentQuarter === 3) {
                    expect(getAccountRevenueQuarterlyResponse.body.months[0].month).to.eq('July')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(1)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[0].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[1].month).to.eq('August')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(2)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[1].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[2].month).to.eq('September')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(3)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[2].month)
                } else if (getCurrentQuarter === 4) {
                    expect(getAccountRevenueQuarterlyResponse.body.months[0].month).to.eq('October')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(1)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[0].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[1].month).to.eq('November')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(2)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[1].month)

                    expect(getAccountRevenueQuarterlyResponse.body.months[2].month).to.eq('December')
                    dashboardPage.getMonthForQuarterlyOnAccountRevenue(3)
                        .should('be.visible')
                        .should('contain.text', getAccountRevenueQuarterlyResponse.body.months[2].month)
                }

                dashboardPage.getMonthValueForQuarterlyOnAccountRevenue(1)
                    .should('be.visible')
                    .then($el => {
                        firstMonthRevenue = $el.text()
                        dashboardPage.getMonthForQuarterlyOnAccountRevenue(1)
                            .should('be.visible')
                            .then($month => {
                                const firstMonth = $month.text()
                                if (getCurrentMonth === firstMonth) {
                                    firstMonthRevenue = firstMonthRevenue.split(',').join('')
                                    expect(parseInt(firstMonthRevenue)).to.eq(Math.round(getAccountRevenueQuarterlyResponse.body.months[0].revenue / 1000000))
                                    expect(parseInt(firstMonthRevenue)).to.eq(parseInt(totalAccountRevenue))
                                    totalAccountRevenueForQuarter = totalAccountRevenueForQuarter + parseInt(firstMonthRevenue)
                                } else {
                                    cy.log('Doesnt match with current month')
                                    expect(parseInt(firstMonthRevenue)).to.eq(0)
                                }
                            })
                    })

                dashboardPage.getMonthValueForQuarterlyOnAccountRevenue(2)
                    .should('be.visible')
                    .then($el => {
                        secondMonthRevenue = $el.text()
                        dashboardPage.getMonthForQuarterlyOnAccountRevenue(2)
                            .should('be.visible')
                            .then($month => {
                                const secondMonth = $month.text()
                                if (getCurrentMonth === secondMonth) {
                                    secondMonthRevenue = secondMonthRevenue.split(',').join('')
                                    expect(parseInt(secondMonthRevenue)).to.eq(Math.round(getAccountRevenueQuarterlyResponse.body.months[1].revenue / 1000000))
                                    expect(parseInt(secondMonthRevenue)).to.eq(parseInt(totalAccountRevenue))
                                    totalAccountRevenueForQuarter = totalAccountRevenueForQuarter + parseInt(secondMonthRevenue)
                                } else {
                                    cy.log('Doesnt match with current month')
                                    expect(parseInt(secondMonthRevenue)).to.eq(0)
                                }
                            })
                    })

                dashboardPage.getMonthValueForQuarterlyOnAccountRevenue(3)
                    .should('be.visible')
                    .then($el => {
                        thirdMonthRevenue = $el.text()
                        dashboardPage.getMonthForQuarterlyOnAccountRevenue(3)
                            .should('be.visible')
                            .then($month => {
                                const thirdMonth = $month.text()
                                if (getCurrentMonth === thirdMonth) {
                                    thirdMonthRevenue = thirdMonthRevenue.split(',').join('')
                                    expect(parseInt(thirdMonthRevenue)).to.eq(Math.round(getAccountRevenueQuarterlyResponse.body.months[2].revenue / 1000000))
                                    expect(parseInt(thirdMonthRevenue)).to.eq(parseInt(totalAccountRevenue))
                                    totalAccountRevenueForQuarter = totalAccountRevenueForQuarter + parseInt(thirdMonthRevenue)
                                } else {
                                    cy.log('Doesnt match with current month')
                                    expect(parseInt(thirdMonthRevenue)).to.eq(0)
                                }
                            })
                    })

                dashboardPage.getQuarterlyTargetForAM()
                    .should('be.visible')
                    .then($el => {
                        QuarterlyTarget = $el.text()
                        if ((getAccountRevenueQuarterlyResponse.body.months[0].target === 0 ||
                            getAccountRevenueQuarterlyResponse.body.months[0].target === null) &&
                            (getAccountRevenueQuarterlyResponse.body.months[1].target === 0 ||
                                getAccountRevenueQuarterlyResponse.body.months[1].target === null) &&
                            (getAccountRevenueQuarterlyResponse.body.months[2].target === 0 ||
                                getAccountRevenueQuarterlyResponse.body.months[2].target === null)) {
                            cy.log('No Quarterly target setted up for AM')
                            expect(parseInt(QuarterlyTarget)).to.eq(0)
                        } else {
                            QuarterlyTarget = QuarterlyTarget.split(',').join('')
                            if (getAccountRevenueQuarterlyResponse.body.months[2].target !== 0 &&
                                getAccountRevenueQuarterlyResponse.body.months[2].target !== null) {
                                expect(parseInt(QuarterlyTarget)).to.eq(getAccountRevenueQuarterlyResponse.body.months[2].target)
                            } else if (getAccountRevenueQuarterlyResponse.body.months[1].target !== 0 &&
                                getAccountRevenueQuarterlyResponse.body.months[1].target !== null) {
                                expect(parseInt(QuarterlyTarget)).to.eq(getAccountRevenueQuarterlyResponse.body.months[1].target)
                            } else if (getAccountRevenueQuarterlyResponse.body.months[0].target !== 0 &&
                                getAccountRevenueQuarterlyResponse.body.months[0].target !== null) {
                                expect(parseInt(QuarterlyTarget)).to.eq(getAccountRevenueQuarterlyResponse.body.months[0].target)
                            }
                        }
                        expect(parseInt(QuarterlyTarget)).to.eq(testUsers.dashboardAccountManager.target)
                    })
            })

        dashboardPage.getMonthValueForQuarterlyOnAccountRevenue(4)
            .should('be.visible')
            .then($el => {
                QuarterRevenue = $el.text()
                QuarterRevenue = QuarterRevenue.split(',').join('')
                expect(parseInt(QuarterRevenue)).to.eq(totalAccountRevenueForQuarter)
            })

        dashboardPage.getQuarterlyAchievementForAM()
            .should('be.visible')
            .then($el => {
                achievement = $el.text()
                achievement = achievement.split(',').join('')
                expect(parseInt(achievement)).to.eq(Math.round((totalAccountRevenueForQuarter / QuarterlyTarget) * 100))
            })

    })
})

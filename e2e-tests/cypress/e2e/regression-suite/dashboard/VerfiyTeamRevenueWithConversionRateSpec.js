import generator from '../../../support/generator'
import DashboardPage from '../../../pageObjects/DashboardPage'
const getCurrentMonthYear = generator.generateCurrentMonthYear()

describe('Verify Team Revenue  details', { tags: "regression" }, function () {
    let testUsers, authToken, testData, projectDetails, segmentId, eplId, conversionRate,
        count, grossMargin, projectId, delieveredBy, month,
        dv, iv, revenue, hono, target, achievement, resultGrossMargin, resultTarget, expertId, convertedFee, convertedHono,
        name, resultGrossMarginFormat, resultTargetFormat, textForTLRevenue, textForTLhono, textForASRevenue, textForAShono

    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const yearMonth = `${generator.generateCurrentYearMonth()}`
    const yesterday = `${generator.generateYesterdayDate()}`
    const todayDate = `${generator.generateTodayDate()}`
    const lastMonth = `${generator.generateLastMonthYear()}`
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const dashboardPage = new DashboardPage()

    let totalDvForTLBefore = 0
    let totalDvForTLAfter = 0
    let totalDvForASBefore = 0
    let totalDvForASAfter = 0
    let totalIvForTLBefore = 0
    let totalIvForTLAfter = 0
    let totalIvForASBefore = 0
    let totalIvForASAfter = 0
    let revenueForTLBefore = 0
    let revenueForTLAfter = 0
    let revenueForASBefore = 0
    let revenueForASAfter = 0
    let totalRevenueForTL = 0
    let totalRevenueForAS = 0
    let honoForTLBefore = 0
    let honoForTLAfter = 0
    let honoForASBefore = 0
    let honoForASAfter = 0
    let totalHonoForTL = 0
    let totalHonoForAS = 0
    let grossMarginForTLBefore = 0
    let grossMarginForTLAfter = 0
    let totalgrossMarginForTL = 0
    let grossMarginForASBefore = 0
    let grossMarginForASAfter = 0
    let totalgrossMarginForAS = 0
    let totalTargetForTL = 0
    let totalTargetForAS = 0

    let expertData = generator.generateExpertNames(1)[0]

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

            cy.fixture('testData').then(testdata => {
                testData = testdata
            })
            cy.fixture('projectDetails').then(projectDetailsFixture => {
                projectDetails = projectDetailsFixture
            })

            if (todayDate === '01') {
                month = lastMonth
            }
            else {
                month = yearMonth
            }
        })
    })

    it('Verify Team Revenue widget for whole team', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()
        cy.requestGetTeamRevenueWidgetData(authToken, getCurrentMonthYear)
            .then(getTeamRevenueWidgetResponse => {
                count = Object.keys(getTeamRevenueWidgetResponse.body.teamMembers).length
                if (count > 0) {
                    dashboardPage.getTeamMembersCountInTeamRevenue()
                        .its('length')
                        .should('eq', count)

                    // Dv of employee
                    dashboardPage.getColumnInTeamRevenue(1, 3)
                        .should('be.visible')
                        .then($empDv => {
                            dv = $empDv.text()
                            totalDvForTLBefore = parseInt(dv)
                        })
                    // Iv of employee
                    dashboardPage.getColumnInTeamRevenue(1, 4)
                        .should('be.visible')
                        .then($empIv => {
                            iv = $empIv.text()
                            totalIvForTLBefore = parseInt(iv)
                        })
                    // Revenue of employee
                    dashboardPage.getColumnInTeamRevenue(1, 5)
                        .should('be.visible')
                        .then($empRevenue => {
                            textForTLRevenue = $empRevenue.text()
                            if (textForTLRevenue === '-') {
                                revenueForTLBefore = 0
                            } else {
                                textForTLRevenue = textForTLRevenue.split(',').join('')
                                revenueForTLBefore = parseInt(textForTLRevenue)
                            }
                        })

                    // Hono. of employee
                    dashboardPage.getColumnInTeamRevenue(1, 6)
                        .should('be.visible')
                        .then($empHono => {
                            textForTLhono = $empHono.text()
                            if (textForTLhono === '-') {
                                honoForTLBefore = 0
                            } else {
                                textForTLhono = textForTLhono.split(',').join('')
                                honoForTLBefore = parseInt(textForTLhono)
                            }
                        })
                    // Gross Margin of employee
                    dashboardPage.getColumnInTeamRevenue(1, 7)
                        .should('be.visible')
                        .then($empGrossMargin => {
                            grossMarginForTLBefore = $empGrossMargin.text()
                            grossMarginForTLBefore = grossMarginForTLBefore.split(',').join('')
                            expect(parseInt(grossMarginForTLBefore)).to.eq(Math.round(revenueForTLBefore - honoForTLBefore))
                        })
                    // Target of employee
                    dashboardPage.getColumnInTeamRevenue(1, 8)
                        .should('be.visible')
                        .then($empTarget => {
                            target = $empTarget.text()
                            target = target.split(',').join('')
                            expect(parseInt(target)).to.eq(testUsers.dashboardTeamLeader.target)
                        })
                    // Achivement of employee
                    dashboardPage.getColumnInTeamRevenue(1, 9)
                        .should('be.visible')
                        .then($empAchievement => {
                            achievement = $empAchievement.text()
                            achievement = achievement.split(',').join('')
                            expect(parseInt(achievement)).to
                                .eq(Math.round((grossMarginForTLBefore / parseInt(target)) * 100))
                        })

                    // Dv of employee
                    dashboardPage.getColumnInTeamRevenue(2, 3)
                        .should('be.visible')
                        .then($empDv => {
                            dv = $empDv.text()
                            totalDvForASBefore = parseInt(dv)
                        })

                    // Iv of employee
                    dashboardPage.getColumnInTeamRevenue(2, 4)
                        .should('be.visible')
                        .then($empIv => {
                            iv = $empIv.text()
                            totalIvForASBefore = parseInt(iv)
                        })

                    // Revenue of employee
                    dashboardPage.getColumnInTeamRevenue(2, 5)
                        .should('be.visible')
                        .then($empRevenue => {
                            textForASRevenue = $empRevenue.text()

                            if (textForASRevenue === '-') {
                                revenueForASBefore = 0
                            } else {
                                textForASRevenue = textForASRevenue.split(',').join('')
                                revenueForASBefore = parseInt(textForASRevenue)
                            }
                        })
                    // Hono. of employee
                    dashboardPage.getColumnInTeamRevenue(2, 6)
                        .should('be.visible')
                        .then($empHono => {
                            textForAShono = $empHono.text()
                            if (textForAShono === '-') {
                                honoForASBefore = 0
                            } else {
                                textForAShono = textForAShono.split(',').join('')
                                honoForASBefore = parseInt(textForAShono)
                            }
                        })
                    // Gross Margin of employee
                    dashboardPage.getColumnInTeamRevenue(2, 7)
                        .should('be.visible')
                        .then($empGrossMargin => {
                            grossMarginForASBefore = $empGrossMargin.text()
                            grossMarginForASBefore = grossMarginForASBefore.split(',').join('')
                            expect(parseInt(grossMarginForASBefore)).to.eq(Math.round(revenueForASBefore - honoForASBefore))
                        })
                    // Target of employee
                    dashboardPage.getColumnInTeamRevenue(2, 8)
                        .should('be.visible')
                        .then($empTarget => {
                            target = $empTarget.text()
                            target = target.split(',').join('')
                            expect(parseInt(target)).to.eq(testUsers.dashboardAssociate.target)
                        })
                    // Achivement of employee
                    dashboardPage.getColumnInTeamRevenue(2, 9)
                        .should('be.visible')
                        .then($empAchievement => {
                            achievement = $empAchievement.text()
                            achievement = achievement.split(',').join('')
                            expect(parseInt(grossMarginForASBefore)).to
                                .eq(0)
                            expect(parseInt(achievement)).to
                                .eq(Math.round((grossMarginForASBefore / parseInt(target)) * 100))
                        })
                }
            })
        // Create test data 
        cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.dashboardTeamLeader.emailAddress, testData.dashboardOfficeName).then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                segmentId = projectCreateResponse.body.segmentId
                cy.addAndInviteExpertToProjectFromAPI(projectId, expertData.expertId).then(
                    addAndInviteExpertToProjectFromAPIResponse => {
                        eplId = addAndInviteExpertToProjectFromAPIResponse.body.id

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

                                //Schedule without zoom
                                cy.fixture('objects/scheduleWithoutZoomObject').then(scheduleWithoutZoom => {
                                    scheduleWithoutZoom.eplId = eplId
                                    scheduleWithoutZoom.timeslots[0].id = uniqueid
                                    scheduleWithoutZoom.timeslots[0].time.start = parseInt(startTime)
                                    scheduleWithoutZoom.timeslots[0].time.end = parseInt(endTime)
                                    cy.requestCreateAvailabilityAndTimeslot(authToken, scheduleWithoutZoom)

                                    //Change to intetviewed
                                    cy.requestGetEPL(authToken, eplId).then(eplRequestResponse => {
                                        expertId = eplRequestResponse.body.expertId
                                        delieveredBy = eplRequestResponse.body.submittedBy
                                        eplRequestResponse.body.eplStatusId = 10
                                        eplRequestResponse.body.relevantExperience.experience.company = eplRequestResponse.body.relevantExperience.experience.company.name
                                        eplRequestResponse.body.relevantExperience.experience.position = eplRequestResponse.body.relevantExperience.experience.position.name
                                        eplRequestResponse.body.interviewDate = todaysDate
                                        cy.requestPutEPL(authToken, eplId, eplRequestResponse.body)

                                        //Create Bundle 
                                        cy.fixture('objects/feeObject').then(feeObject => {
                                            feeObject.expertProjectLinkId = eplId
                                            feeObject.expertId = expertId
                                            feeObject.projectId = projectId

                                            cy.requestGetEmployees(authToken, 'Dashboard TeamLeader').then(getEmployeeResponse => {
                                                delieveredBy = getEmployeeResponse.body.rows[0].id
                                                feeObject.deliveredBy = delieveredBy
                                                feeObject.deliveryDate = todaysDate
                                                feeObject.feeItems[0].value = projectDetails.feeAmountField
                                                feeObject.feeItems[1].value = projectDetails.honorariumAmount
                                                feeObject.feeItems[0].currencyId = 2
                                                feeObject.feeItems[1].currencyId = 2
                                                cy.requestPostFee(authToken, feeObject).then(postFeeResponse => {
                                                    convertedFee = Math.round(postFeeResponse.body.feeItems[0].converted)
                                                    convertedHono = Math.round(postFeeResponse.body.feeItems[1].converted)
                                                    cy.requestPutEPLDeliveredBy(authToken, eplId, delieveredBy)
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
            })

        // Verify team revenue after data creation
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/dashboard`)
        cy.waitForLoadingDisappear()
        cy.requestGetTeamRevenueWidgetData(authToken, getCurrentMonthYear)
            .then(getTeamRevenueWidgetResponse => {
                count = Object.keys(getTeamRevenueWidgetResponse.body.teamMembers).length
                if (count > 0) {
                    dashboardPage.getTeamMembersCountInTeamRevenue()
                        .its('length')
                        .should('eq', count)

                    // Dv of employee
                    dashboardPage.getColumnInTeamRevenue(1, 3)
                        .should('be.visible')
                        .then($empDv => {
                            dv = $empDv.text()
                            totalDvForTLAfter = totalDvForTLBefore + 1
                            expect(parseInt(dv)).to.eq(totalDvForTLAfter)
                        })

                    // Iv of employee
                    dashboardPage.getColumnInTeamRevenue(1, 4)
                        .should('be.visible')
                        .then($empIv => {
                            iv = $empIv.text()
                            totalIvForTLAfter = totalIvForTLBefore + 1
                            expect(parseInt(iv)).to.eq(totalIvForTLAfter)
                        })

                    // Revenue of employee
                    dashboardPage.getColumnInTeamRevenue(1, 5)
                        .should('be.visible')
                        .then($empRevenue => {
                            textForTLRevenue = $empRevenue.text()
                            textForTLRevenue = textForTLRevenue.split(',').join('')
                            revenueForTLAfter = parseInt(textForTLRevenue)

                            cy.requestGetCurrencyRates(authToken, month)
                                .then(getCurrencyRatesResponse => {
                                    conversionRate = getCurrencyRatesResponse.body.filter(
                                        conversionRate => conversionRate.date === yesterday
                                    )[0].eurToUsd

                                    expect(convertedFee).to.eq(Math.round(projectDetails.feeAmountField / conversionRate))
                                    totalRevenueForTL = revenueForTLBefore + convertedFee
                                    expect(revenueForTLAfter).to.eq(totalRevenueForTL)
                                })

                            // Hono. of employee
                            dashboardPage.getColumnInTeamRevenue(1, 6)
                                .should('be.visible')
                                .then($empHono => {
                                    textForTLhono = $empHono.text()
                                    textForTLhono = textForTLhono.split(',').join('')
                                    honoForTLAfter = parseInt(textForTLhono)
                                    expect(convertedHono).to.eq(Math.round(projectDetails.honorariumAmount / conversionRate))
                                    totalHonoForTL = honoForTLBefore + convertedHono
                                    expect(honoForTLAfter).to.eq(totalHonoForTL)
                                })
                        })
                    // Gross Margin of employee
                    dashboardPage.getColumnInTeamRevenue(1, 7)
                        .should('be.visible')
                        .then($empGrossMargin => {
                            grossMarginForTLAfter = $empGrossMargin.text()
                            grossMarginForTLAfter = grossMarginForTLAfter.split(',').join('')
                            expect(parseInt(grossMarginForTLAfter)).to.eq(Math.round(totalRevenueForTL - totalHonoForTL))
                            totalgrossMarginForTL = parseInt(grossMarginForTLAfter)
                        })
                    // Target of employee
                    dashboardPage.getColumnInTeamRevenue(1, 8)
                        .should('be.visible')
                        .then($empTarget => {
                            target = $empTarget.text()
                            target = target.split(',').join('')
                            expect(parseInt(target)).to.eq(testUsers.dashboardTeamLeader.target)
                            totalTargetForTL = parseInt(target)
                        })
                    // Achivement of employee
                    dashboardPage.getColumnInTeamRevenue(1, 9)
                        .should('be.visible')
                        .then($empAchievement => {
                            achievement = $empAchievement.text()
                            achievement = achievement.split(',').join('')
                            expect(parseInt(achievement)).to
                                .eq(Math.round((grossMarginForTLAfter / totalTargetForTL) * 100))
                        })
                    // Name of employee
                    dashboardPage.getColumnInTeamRevenue(2, 1)
                        .should('be.visible')
                        .then($empName => {
                            const name = $empName.text().trim()
                            expect(name).to.eq(`${testUsers.dashboardAssociate.firstName} ${testUsers.dashboardAssociate.lastName}`)
                        })
                    // Position of employee
                    dashboardPage.getColumnInTeamRevenue(2, 2)
                        .should('be.visible')
                        .then($empPosition => {
                            const position = $empPosition.text().trim()
                            expect(position).to.eq(testUsers.dashboardAssociate.position)
                        })
                    // Dv of employee
                    dashboardPage.getColumnInTeamRevenue(2, 3)
                        .should('be.visible')
                        .then($empDv => {
                            dv = $empDv.text()
                            expect(parseInt(dv)).to.eq(totalDvForASBefore)
                            totalDvForASAfter = totalDvForASBefore
                        })
                    // Iv of employee
                    dashboardPage.getColumnInTeamRevenue(2, 4)
                        .should('be.visible')
                        .then($empIv => {
                            iv = $empIv.text()
                            expect(parseInt(iv)).to.eq(totalIvForASBefore)
                            totalIvForASAfter = totalIvForASBefore
                        })
                    // Revenue of employee
                    dashboardPage.getColumnInTeamRevenue(2, 5)
                        .should('be.visible')
                        .then($empRevenue => {
                            textForASRevenue = $empRevenue.text()

                            if (textForASRevenue === '-') {
                                revenueForASAfter = 0
                            } else {
                                textForASRevenue = textForASRevenue.split(',').join('')
                                revenueForASAfter = parseInt(textForASRevenue)
                            }
                            expect(revenueForASAfter).to.eq(revenueForASBefore)
                            totalRevenueForAS = revenueForASBefore

                        })
                    // Hono. of employee
                    dashboardPage.getColumnInTeamRevenue(2, 6)
                        .should('be.visible')
                        .then($empHono => {
                            textForAShono = $empHono.text()
                            if (textForAShono === '-') {
                                honoForASAfter = 0
                            } else {
                                textForAShono = textForAShono.split(',').join('')
                                honoForASAfter = parseInt(textForAShono)
                            }
                            expect(honoForASAfter).to.eq(honoForASBefore)
                            totalHonoForAS = honoForASBefore
                        })
                    // Gross Margin of employee
                    dashboardPage.getColumnInTeamRevenue(2, 7)
                        .should('be.visible')
                        .then($empGrossMargin => {
                            grossMarginForASAfter = $empGrossMargin.text()
                            grossMarginForASAfter = grossMarginForASAfter.split(',').join('')
                            expect(parseInt(grossMarginForASAfter)).to.eq(Math.round(totalRevenueForAS - totalHonoForAS))
                            totalgrossMarginForAS = parseInt(grossMarginForASAfter)
                        })
                    // Target of employee
                    dashboardPage.getColumnInTeamRevenue(2, 8)
                        .should('be.visible')
                        .then($empTarget => {
                            target = $empTarget.text()
                            target = target.split(',').join('')
                            expect(parseInt(target)).to.eq(testUsers.dashboardAssociate.target)
                            totalTargetForAS = parseInt(target)
                        })
                    // Achivement of employee
                    dashboardPage.getColumnInTeamRevenue(2, 9)
                        .should('be.visible')
                        .then($empAchievement => {
                            achievement = $empAchievement.text()
                            achievement = achievement.split(',').join('')
                            expect(parseInt(achievement)).to
                                .eq(Math.round((totalgrossMarginForAS / totalTargetForAS) * 100))

                        })
                    // Total Dv
                    dashboardPage.getTotalColumnInTeamRevenue(3)
                        .should('be.visible')
                        .then($el => {
                            const resultDv = $el.text()
                            expect(parseInt(resultDv)).to.eq(totalDvForTLAfter + totalDvForASAfter)
                        })

                    dashboardPage.getTotalColumnInTeamRevenue(4)
                        .should('be.visible')
                        .then($el => {
                            const resultIv = $el.text()
                            expect(parseInt(resultIv)).to.eq(totalIvForTLAfter + totalIvForASAfter)
                        })

                    dashboardPage.getTotalColumnInTeamRevenue(5)
                        .should('be.visible')
                        .then($el => {
                            const resultRevenue = $el.text()
                            const resultRevenueFormat = resultRevenue.split(',').join('')
                            expect(parseInt(resultRevenueFormat)).to.eq(totalRevenueForTL + totalRevenueForAS)
                        })

                    dashboardPage.getTotalColumnInTeamRevenue(6)
                        .should('be.visible')
                        .then($el => {
                            const resultHono = $el.text()
                            const resulthonoFormat = resultHono.split(',').join('')
                            expect(parseInt(resulthonoFormat)).to.eq(totalHonoForTL + totalHonoForAS)
                        })

                    dashboardPage.getTotalColumnInTeamRevenue(7)
                        .should('be.visible')
                        .then($el => {
                            resultGrossMargin = $el.text()
                            resultGrossMarginFormat = resultGrossMargin.split(',').join('')
                            expect(parseInt(resultGrossMarginFormat)).to.eq(totalgrossMarginForTL + totalgrossMarginForAS)
                        })

                    dashboardPage.getTotalColumnInTeamRevenue(8)
                        .should('be.visible')
                        .then($el => {
                            resultTarget = $el.text()
                            resultTargetFormat = resultTarget.split(',').join('')
                            expect(parseInt(resultTargetFormat)).to.eq(testUsers.dashboardTeamLeader.target + testUsers.dashboardAssociate.target)
                        })

                    dashboardPage.getTotalColumnInTeamRevenue(9)
                        .should('be.visible')
                        .then($el => {
                            const resultAchievement = $el.text()
                            const resultAchievementFormat = resultAchievement.split(',').join('')
                            expect(parseInt(resultAchievementFormat)).to.eq(Math.round((parseInt(resultGrossMarginFormat) / parseInt(resultTargetFormat)) * 100))
                        })
                }
            })
    })

    it('Verfiy Team Revenue widget for subteams', function () {
        dashboardPage.getASubTeam(1)
            .should('be.visible').click()
        // Name of employee
        dashboardPage.getClolumnInSubTeam(1, 1)
            .should('be.visible')
            .then($empName => {
                name = $empName.text().trim()
                expect(name).to.eq(`${testUsers.dashboardTeamLeader.firstName} ${testUsers.dashboardTeamLeader.lastName}`)
            })

        // Position of employee
        dashboardPage.getColumnInTeamRevenue(1, 2)
            .should('be.visible')
            .then($empPosition => {
                const position = $empPosition.text().trim()
                expect(position).to.eq(testUsers.dashboardTeamLeader.position)
            })

        // Dv of employee
        dashboardPage.getClolumnInSubTeam(1, 3)
            .should('be.visible')
            .then($empDv => {
                dv = $empDv.text()
                expect(parseInt(dv)).to.eq(totalDvForTLAfter)
            })

        // Iv of employee
        dashboardPage.getClolumnInSubTeam(1, 4)
            .should('be.visible')
            .then($empIv => {
                iv = $empIv.text()
                expect(parseInt(iv)).to.eq(totalIvForTLAfter)
            })

        // Revenue of employee
        dashboardPage.getClolumnInSubTeam(1, 5)
            .should('be.visible')
            .then($empRevenue => {
                revenue = $empRevenue.text()
                revenue = revenue.split(',').join('')
                expect(parseInt(revenue)).to.eq(totalRevenueForTL)
            })

        // Hono. of employee
        dashboardPage.getClolumnInSubTeam(1, 6)
            .should('be.visible')
            .then($empHono => {
                hono = $empHono.text()
                hono = hono.split(',').join('')
                expect(parseInt(hono)).to.eq(totalHonoForTL)
            })
        // Gross Margin of employee
        dashboardPage.getClolumnInSubTeam(1, 7)
            .should('be.visible')
            .then($empGrossMargin => {
                grossMargin = $empGrossMargin.text()
                grossMargin = grossMargin.split(',').join('')
                expect(parseInt(grossMargin)).to.eq(Math.round(totalRevenueForTL - totalHonoForTL))
            })
        // Target of employee
        dashboardPage.getClolumnInSubTeam(1, 8)
            .should('be.visible')
            .then($empTarget => {
                target = $empTarget.text()
                target = target.split(',').join('')
                expect(parseInt(target)).to.eq(testUsers.dashboardTeamLeader.target)
            })
        // Achivement of employee
        dashboardPage.getClolumnInSubTeam(1, 9)
            .should('be.visible')
            .then($empAchievement => {
                achievement = $empAchievement.text()
                achievement = achievement.split(',').join('')
                expect(parseInt(achievement)).to
                    .eq(Math.round((grossMargin / target) * 100))
            })

        // Name of employee
        dashboardPage.getClolumnInSubTeam(2, 1)
            .should('be.visible')
            .then($empName => {
                const name = $empName.text().trim()
                expect(name).to.eq(`${testUsers.dashboardAssociate.firstName} ${testUsers.dashboardAssociate.lastName}`)
            })

        // Position of employee
        dashboardPage.getClolumnInSubTeam(2, 2)
            .should('be.visible')
            .then($empPosition => {
                const position = $empPosition.text()
                expect(position).to.eq(testUsers.dashboardAssociate.position)
            })

        // Dv of employee
        dashboardPage.getClolumnInSubTeam(2, 3)
            .should('be.visible')
            .then($empDv => {
                dv = $empDv.text()
                expect(parseInt(dv)).to.eq(totalDvForASBefore)
            })

        // Iv of employee
        dashboardPage.getClolumnInSubTeam(2, 4)
            .should('be.visible')
            .then($empIv => {
                iv = $empIv.text()
                expect(parseInt(iv)).to.eq(totalIvForASBefore)
            })

        // Revenue of employee
        dashboardPage.getClolumnInSubTeam(2, 5)
            .should('be.visible')
            .then($empRevenue => {
                revenue = $empRevenue.text()
                expect(revenue).to.eq('-')
            })
        // Hono. of employee
        dashboardPage.getClolumnInSubTeam(2, 6)
            .should('be.visible')
            .then($empHono => {
                hono = $empHono.text()
                expect(hono).to.eq('-')
            })
        // Gross Margin of employee
        dashboardPage.getClolumnInSubTeam(2, 7)
            .should('be.visible')
            .then($empGrossMargin => {
                grossMargin = $empGrossMargin.text()
                grossMargin = grossMargin.split(',').join('')
                expect(parseInt(grossMargin)).to.eq(0)
            })
        // Target of employee
        dashboardPage.getClolumnInSubTeam(2, 8)
            .should('be.visible')
            .then($empTarget => {
                target = $empTarget.text()
                target = target.split(',').join('')
                expect(parseInt(target)).to.eq(testUsers.dashboardAssociate.target)
            })
        // Achivement of employee
        dashboardPage.getClolumnInSubTeam(2, 9)
            .should('be.visible')
            .then($empAchievement => {
                achievement = $empAchievement.text()
                achievement = achievement.split(',').join('')
                expect(parseInt(achievement)).to
                    .eq(0)
            })
    })
})

import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import PerformanceReportPage from '../../../pageObjects/PerformanceReportPage'
import FeePage from '../../../pageObjects/FeePage'

describe('Check Performance report as Account Manager', { tags: "regression" }, function () {
    let projectId,
        authToken,
        testUsers,
        eplId,
        segmentId,
        projectDetails,
        expertId,
        delieveredBy,
        authInfoUpdated,
        authTokenUpdated,
        totalFeeBefore,
        totalCostBefore,
        totalFeeAfter,
        totalCostAfter,
        totalMarginBefore,
        totalMarginAfter,
        reportDetails

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const globalPage = new GlobalPage()
    const feePage = new FeePage()

    const performanceReportPage = new PerformanceReportPage()
    const monthYear = `${generator.returnDateinYYYYMMFormat()}`
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.teamLeader.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {

                cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                    expertCreateObject.firstName = expertData.firstName
                    expertCreateObject.lastName = expertData.lastName
                    expertCreateObject.originalName = expertData.originalName
                    expertCreateObject.email = expertData.email
                    cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                        expertCreateResponse => {
                            expertData.expertId = expertCreateResponse.body.id
                        }
                    )
                })

            })
            cy.requestLogIn(
                testUsers.associate.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
            })
        })

        cy.fixture('reportDetails').then(reportDetailsFixture => {
            reportDetails = reportDetailsFixture
        })
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.fixture('projectDetails').then(projectDetailsFixture => {
                projectDetails = projectDetailsFixture

                cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
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
                                                cy.fixture('testUsers').then(testUsers => {
                                                    cy.requestLogIn(
                                                        testUsers.accountManager.emailAddress,
                                                        Cypress.env('CYPRESS_USER_PASSWORD')
                                                    ).then(loginResponse => {
                                                        authTokenUpdated = loginResponse.body.token
                                                        authInfoUpdated = loginResponse
                                                    })
                                                    cy.fixture('objects/feeObject').then(feeObject => {
                                                        feeObject.expertProjectLinkId = eplId
                                                        feeObject.expertId = expertId
                                                        feeObject.projectId = projectId
                                                        feeObject.deliveredBy = delieveredBy
                                                        feeObject.deliveryDate = todaysDate
                                                        feeObject.feeItems[0].value = projectDetails.feeAmountField
                                                        feeObject.feeItems[1].value = projectDetails.honorariumAmount
                                                        cy.requestPostFee(authTokenUpdated, feeObject)
                                                    })
                                                })
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
        cy.intercept('PUT', '/api/fee/*').as('waitForFeeToBeEdited')
        cy.setLocalStorageLoginInfo(authInfoUpdated.body.user, authInfoUpdated.body.token)
    })

    it('Should show Performance report for selected employee', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/performance`)
        performanceReportPage.selectEmployee(testUsers.associate.firstName + ' ' + testUsers.associate.lastName)
        cy.requestGetPerformanceReport(authToken, monthYear, delieveredBy).then(
            PerformanceReportResult => {
                performanceReportPage.getPerformanceReportResults()
                    .should('have.length', PerformanceReportResult.body.length + 1)
                performanceReportPage.getEmployeeName().last().contains(testUsers.associate.firstName + ' ' + testUsers.associate.lastName)
                performanceReportPage.getAccountManagerName().last().contains(testUsers.accountManager.firstName + ' ' + testUsers.accountManager.lastName)
                performanceReportPage.getExpertName().last().should('have.text', expertData.originalName)
                performanceReportPage.getFeeType().last().contains(reportDetails.feeType)
                performanceReportPage.getProjectName().last().contains(projectName)
                performanceReportPage.getPerformanceReportResults().contains(projectDetails.honorariumAmount)
                performanceReportPage.getPerformanceReportResults().contains(projectDetails.feeAmountField)
                performanceReportPage.getPerformanceReportResults().contains(projectDetails.feeAmountField - projectDetails.honorariumAmount)
            })
        performanceReportPage.getTotalFee()
            .then($totalFee => {
                totalFeeBefore = $totalFee.text()
                totalFeeBefore = totalFeeBefore.split(',').join('')
                performanceReportPage.getTotalCost()
                    .then($totalCost => {
                        totalCostBefore = $totalCost.text()
                        totalCostBefore = totalCostBefore.split(',').join('')
                        performanceReportPage.getTotalMargin()
                            .then($totalMargin => {
                                totalMarginBefore = $totalMargin.text()
                                totalMarginBefore = totalMarginBefore.split(',').join('')
                                expect(parseInt(totalMarginBefore)).to.eq(parseInt(totalFeeBefore) - parseInt(totalCostBefore))
                            })
                    })
            })
    })

    it('Should update the total for selected employee after updating the bundle', function () {
        performanceReportPage.getProjectName().last().click()
        performanceReportPage.getProjectNameOnSideBar().click()
        feePage.getOutcometab().click()
        feePage.getEditButtonOnOutcome().click()
        feePage.getFeeField().clear().type(reportDetails.updateFeeAmountField)
        feePage.getCostField().clear().type(reportDetails.updateHonorariumAmount)
        globalPage.submitButton().click()
        cy.wait('@waitForFeeToBeEdited')
            .its('response.statusCode')
            .should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/performance`)
        performanceReportPage.selectEmployee(testUsers.associate.firstName + ' ' + testUsers.associate.lastName)
        performanceReportPage.getTotalFee()
            .then($totalFee => {
                totalFeeAfter = $totalFee.text()
                totalFeeAfter = totalFeeAfter.split(',').join('')
                expect(parseInt(totalFeeAfter)).to.eq(parseInt(totalFeeBefore) +
                    (parseInt(reportDetails.updateFeeAmountField) - parseInt(projectDetails.feeAmountField)))
                performanceReportPage.getTotalCost()
                    .then($totalCost => {
                        totalCostAfter = $totalCost.text()
                        totalCostAfter = totalCostAfter.split(',').join('')
                        expect(parseInt(totalCostAfter)).to.eq(parseInt(totalCostBefore) +
                            (parseInt(reportDetails.updateHonorariumAmount) - parseInt(projectDetails.honorariumAmount)))
                        performanceReportPage.getTotalMargin()
                            .then($totalMargin => {
                                totalMarginAfter = $totalMargin.text()
                                totalMarginAfter = totalMarginAfter.split(',').join('')
                                expect(parseInt(totalMarginAfter)).to.eq(parseInt(totalFeeAfter) - parseInt(totalCostAfter))
                            })
                    })
            })
    })
})

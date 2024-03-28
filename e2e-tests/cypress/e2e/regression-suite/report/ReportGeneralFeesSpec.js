import generator from '../../../support/generator'
import GeneralFeesPage from '../../../pageObjects/GeneralFeesPage'

describe('Check General fees report as Accounting employee', { tags: "regression" }, function () {
    let authInfo,
        projectId,
        authToken,
        testUsers,
        eplId,
        segmentId,
        projectDetails,
        expertId,
        delieveredBy,
        accountId,
        testData,
        reportDetails,
        deliverableId,
        totalFee,
        totalCost

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const generalFeesPage = new GeneralFeesPage()
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const firstDateofMoth = `${generator.returnFirstDateOfCurrentMonth()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const dateOnRevenueReport = `${generator.generateMonthnameDDYYYY()}`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.teamLeader.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
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
        cy.fixture('reportDetails').then(reportDetailsFixture => {
            reportDetails = reportDetailsFixture
        })
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.fixture('projectDetails').then(projectDetailsFixture => {
                projectDetails = projectDetailsFixture
                cy.fixture('testData').then(testdata => {
                    testData = testdata
                    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
                        projectCreateResponse => {
                            projectId = projectCreateResponse.body.id
                            segmentId = projectCreateResponse.body.segmentId
                            accountId = projectCreateResponse.body.accountId
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
                                                        feeObject.deliveredBy = delieveredBy
                                                        feeObject.deliveryDate = todaysDate
                                                        feeObject.feeItems[0].value = projectDetails.feeAmountField
                                                        feeObject.feeItems[1].value = projectDetails.honorariumAmount
                                                        cy.requestPostFee(authToken, feeObject).then(createdFeeResponse => {
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                        })
                })
                cy.requestLogIn(
                    testUsers.accounting.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    authToken = quickLoginResponse.body.token
                    authInfo = quickLoginResponse
                })
            })
        })
    })

    beforeEach(function () {
        cy.intercept('POST', '**/api/report/general-fees').as('waitForGeneralFeesDetails')
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    })

    it('Should show General fees of all types for current month', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/general-fees`)
        generalFeesPage.getClearSearchBtn().click()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        cy.fixture('objects/generalFeesObject').then(generalFeesObject => {
            generalFeesObject.startDate = firstDateofMoth
            generalFeesObject.endDate = todaysDate
            generalFeesObject.feeType = reportDetails.generalfeesTypeAll
            cy.requestGeneralFeesReports(authToken, generalFeesObject)
                .then(generalFeesResponse => {
                    generalFeesPage.getTotalResults().should('have.length', generalFeesResponse.body.rows.length)
                })
        })
    })

    it('Should show General fees of type Bundle for specific client Account', function () {
        generalFeesPage.getClearSearchBtn().click()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectClientAccount(testData.accountName)
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectType('Bundle')
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        cy.fixture('objects/generalFeesObject').then(generalFeesObject => {
            generalFeesObject.account = accountId
            generalFeesObject.startDate = firstDateofMoth
            generalFeesObject.endDate = todaysDate
            generalFeesObject.feeType = reportDetails.generalfeesTypeBundle
            cy.requestGeneralFeesReports(authToken, generalFeesObject)
                .then(generalFeesResponse => {
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].clientAccount)
                })
        })
    })

    it('Should show General fees of type Bundle for specific project with no contract', function () {
        generalFeesPage.getClearSearchBtn().click()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectProject(projectName)
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectType('Bundle')
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.getWithoutContract().check()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        cy.fixture('objects/generalFeesObject').then(generalFeesObject => {
            generalFeesObject.project = projectId
            generalFeesObject.startDate = firstDateofMoth
            generalFeesObject.endDate = todaysDate
            generalFeesObject.feeType = reportDetails.generalfeesTypeBundle
            generalFeesObject.noContract = true
            cy.requestGeneralFeesReports(authToken, generalFeesObject)
                .then(generalFeesResponse => {
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].clientAccount)
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].projectName)
                    generalFeesPage.getFeeType().contains(reportDetails.feeType)
                    generalFeesPage.getExpertName().should('have.text', expertData.originalName)
                    generalFeesPage.getDelieveryDate().contains(dateOnRevenueReport)
                    generalFeesPage.getCallDurationDetail().contains(60)
                    generalFeesPage.getCost().contains(projectDetails.honorariumAmount)
                    generalFeesPage.getCost().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getFee().contains(projectDetails.feeAmountField)
                    generalFeesPage.getFee().contains(projectDetails.feeCurrency)
                })
        })
    })

    it('Should show General fees of type Client charge for specific project', function () {
        cy.requestGetProjectDeliverables(authToken, projectId).then(projectDelieverableResponse => {
            deliverableId = projectDelieverableResponse.body[0].id
            cy.fixture('objects/clientChargeObject').then(clientChargeObject => {
                clientChargeObject.deliverableId = deliverableId
                clientChargeObject.projectId = projectId
                clientChargeObject.deliveredBy = delieveredBy
                clientChargeObject.deliveryDate = todaysDate
                clientChargeObject.feeItems[0].value = projectDetails.clietChargeAmount
                cy.requestPostFee(authToken, clientChargeObject)
            })
        })
        generalFeesPage.getClearSearchBtn().click()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectProject(projectName)
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectType('Client charge')
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.getWithoutContract().check()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        cy.fixture('objects/generalFeesObject').then(generalFeesObject => {
            generalFeesObject.project = projectId
            generalFeesObject.startDate = firstDateofMoth
            generalFeesObject.endDate = todaysDate
            generalFeesObject.feeType = reportDetails.generalfeesTypeClientCharge
            generalFeesObject.noContract = true
            cy.requestGeneralFeesReports(authToken, generalFeesObject)
                .then(generalFeesResponse => {
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].clientAccount)
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].projectName)
                    generalFeesPage.getFeeType().contains(reportDetails.feeType)
                    generalFeesPage.getDelieveryDate().contains(dateOnRevenueReport)
                    generalFeesPage.getCallDurationDetail().contains(0)
                    generalFeesPage.getCost().contains(0)
                    generalFeesPage.getCost().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getFee().contains(projectDetails.clietChargeAmount)
                    generalFeesPage.getFee().contains(projectDetails.feeCurrency)
                    generalFeesPage.getTotalCost().contains(projectDetails.honorariumAmount)
                    generalFeesPage.getTotalCost().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getTotalFee().contains(projectDetails.feeCurrency)
                    totalFee = parseInt(projectDetails.feeAmountField) + parseInt(projectDetails.clietChargeAmount)
                    generalFeesPage.getTotalFee().contains(totalFee.toString())
                    generalFeesPage.getTotalFeeOntop().contains(projectDetails.feeCurrency)
                    generalFeesPage.getTotalFeeOntop().contains(totalFee.toString())
                    generalFeesPage.getTotalCostOntop().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getTotalCostOntop().contains(projectDetails.honorariumAmount)
                })
        })
    })

    it('Should show General fees of type Cost for specific project', function () {
        cy.requestGetProjectDeliverables(authToken, projectId).then(projectDelieverableResponse => {
            deliverableId = projectDelieverableResponse.body[0].id
            cy.fixture('objects/costObject').then(costObject => {
                costObject.deliverableId = deliverableId
                costObject.expertId = expertId
                costObject.projectId = projectId
                costObject.deliveredBy = delieveredBy
                costObject.deliveryDate = todaysDate
                costObject.feeItems[0].value = projectDetails.costAmount
                cy.requestPostFee(authToken, costObject)
            })
        })
        generalFeesPage.getClearSearchBtn().click()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectProject(projectName)
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.selectType('Cost')
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        generalFeesPage.getWithoutContract().check()
        cy.wait('@waitForGeneralFeesDetails').its('response.statusCode').should('eq', 200)
        cy.fixture('objects/generalFeesObject').then(generalFeesObject => {
            generalFeesObject.project = projectId
            generalFeesObject.startDate = firstDateofMoth
            generalFeesObject.endDate = todaysDate
            generalFeesObject.feeType = reportDetails.generalfeesTypeCost
            generalFeesObject.noContract = true
            cy.requestGeneralFeesReports(authToken, generalFeesObject)
                .then(generalFeesResponse => {
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].clientAccount)
                    generalFeesPage.getTitle().contains(generalFeesResponse.body.rows[0].projectName)
                    generalFeesPage.getFeeType().contains('Expert - Honorarium')
                    generalFeesPage.getDelieveryDate().contains(dateOnRevenueReport)
                    generalFeesPage.getCallDurationDetail().contains(0)
                    generalFeesPage.getCost().contains(projectDetails.costAmount)
                    generalFeesPage.getCost().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getFee().contains(0)
                    generalFeesPage.getFee().contains(projectDetails.feeCurrency)
                    totalCost = parseInt(projectDetails.honorariumAmount) + parseInt(projectDetails.costAmount)
                    generalFeesPage.getTotalFeeOntop().contains(projectDetails.feeCurrency)
                    generalFeesPage.getTotalFeeOntop().contains(totalFee.toString())
                    generalFeesPage.getTotalCostOntop().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getTotalCostOntop().contains(totalCost.toString())
                    generalFeesPage.getTotalCost().contains(totalCost.toString())
                    generalFeesPage.getTotalCost().contains(projectDetails.honorariumCurrency)
                    generalFeesPage.getTotalFee().contains(projectDetails.feeCurrency)
                    generalFeesPage.getTotalFee().contains(totalFee.toString())
                })
        })
    })
})

import generator from '../../../support/generator'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import RevenuePage from '../../../pageObjects/RevenuePage'

describe('Check Revenues report as Team Leader', { tags: "regression" }, function () {
    let authInfo,
        projectId,
        atheneumOffice,
        projectType,
        clientAccountType,
        authToken,
        eplId,
        segmentId,
        projectDetails,
        expertId,
        delieveredBy,
        updatedProjectType

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const projectDetailsPage = new ProjectDetailsPage()
    const revenuePage = new RevenuePage()
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
                authToken = loginResponse.body.token
                authInfo = loginResponse

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
        cy.fixture('projectDetails').then(projectDetailsFixture => {
            projectDetails = projectDetailsFixture

            cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
                projectCreateResponse => {
                    projectId = projectCreateResponse.body.id
                    atheneumOffice = projectCreateResponse.body.atheneumOfficeId
                    projectType = projectCreateResponse.body.projectTypeId
                    segmentId = projectCreateResponse.body.segmentId
                    clientAccountType = projectCreateResponse.body.office.account.parentAccount.accountTypeId
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
                                                cy.requestPostFee(authToken, feeObject)
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
        cy.intercept('PUT', '/api/project/*').as('waitForProjectDetailsToBeEdited')
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    })

    it('Should show revenues for project type as Expert Sessions', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/revenues`)
        revenuePage.getClearSearchBtn().click()
        revenuePage.getAccountProjectEmployeeSearchField().type(`${projectName}{enter}`)
        revenuePage.getAutocompleteItems().click()
        revenuePage.selectAtheneumOffice('Berlin')
        revenuePage.selectProjectType('Expert Sessions')
        revenuePage.selectClientAccount('Hedge Fund')
        cy.requestGetRevenuesReport(authToken, monthYear, atheneumOffice, projectType, clientAccountType, projectId)
            .then(
                RevenueReportResult => {
                    revenuePage.getRevenueResults()
                        .should('have.length', RevenueReportResult.body.length)
                    revenuePage.getRevenueResults().contains(projectName)
                    revenuePage.getRevenueResults().contains(projectDetails.honorariumAmount)
                    revenuePage.getRevenueResults().contains(projectDetails.feeAmountField)
                })

    })

    it('Should show revenues for project type as Expert-backed Research', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        projectDetailsPage.getEditProjectBtn().click()
        projectDetailsPage.getProjectTypeEBR().click()
        projectDetailsPage.submitButton().scrollIntoView().click()
        cy.wait('@waitForProjectDetailsToBeEdited')
            .its('response.statusCode')
            .should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/revenues`)
        revenuePage.getClearSearchBtn().click()
        revenuePage.getAccountProjectEmployeeSearchField().type(`${projectName}{enter}`)
        revenuePage.getAutocompleteItems().click()
        revenuePage.selectAtheneumOffice('Berlin')
        revenuePage.selectProjectType('Expert-backed Research')
        revenuePage.selectClientAccount('Hedge Fund')
        updatedProjectType = 2
        cy.requestGetRevenuesReport(authToken, monthYear, atheneumOffice, updatedProjectType, clientAccountType, projectId)
            .then(
                RevenueReportResult => {
                    revenuePage.getRevenueResults()
                        .should('have.length', RevenueReportResult.body.length)
                    revenuePage.getRevenueResults().contains(projectName)
                    revenuePage.getRevenueResults().contains(projectDetails.honorariumAmount)
                    revenuePage.getRevenueResults().contains(projectDetails.feeAmountField)
                })

    })

    it('Should show revenues for project type as Expert Placement', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        projectDetailsPage.getEditProjectBtn().click()
        projectDetailsPage.getProjectTypeEP().click()
        projectDetailsPage.submitButton().scrollIntoView().click()
        cy.wait('@waitForProjectDetailsToBeEdited')
            .its('response.statusCode')
            .should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/revenues`)
        revenuePage.getClearSearchBtn().click()
        revenuePage.getAccountProjectEmployeeSearchField().type(`${projectName}{enter}`)
        revenuePage.getAutocompleteItems().click()
        revenuePage.selectAtheneumOffice('Berlin')
        revenuePage.selectProjectType('Expert Placement')
        revenuePage.selectClientAccount('Hedge Fund')
        updatedProjectType = 3
        cy.requestGetRevenuesReport(authToken, monthYear, atheneumOffice, updatedProjectType, clientAccountType, projectId)
            .then(
                RevenueReportResult => {
                    revenuePage.getRevenueResults()
                        .should('have.length', RevenueReportResult.body.length)
                    revenuePage.getRevenueResults().contains(projectName)
                    revenuePage.getRevenueResults().contains(projectDetails.honorariumAmount)
                    revenuePage.getRevenueResults().contains(projectDetails.feeAmountField)
                })

    })

    it('Should show revenues for project type as Expert Survey Research', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        projectDetailsPage.getEditProjectBtn().click()
        projectDetailsPage.getProjectTypeESR().click()
        projectDetailsPage.submitButton().scrollIntoView().click()
        cy.wait('@waitForProjectDetailsToBeEdited')
            .its('response.statusCode')
            .should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/revenues`)
        revenuePage.getClearSearchBtn().click()
        revenuePage.getAccountProjectEmployeeSearchField().type(`${projectName}{enter}`)
        revenuePage.getAutocompleteItems().click()
        revenuePage.selectAtheneumOffice('Berlin')
        revenuePage.selectProjectType('Expert Survey Research')
        revenuePage.selectClientAccount('Hedge Fund')
        updatedProjectType = 4
        cy.requestGetRevenuesReport(authToken, monthYear, atheneumOffice, updatedProjectType, clientAccountType, projectId)
            .then(
                RevenueReportResult => {
                    revenuePage.getRevenueResults()
                        .should('have.length', RevenueReportResult.body.length)
                    revenuePage.getRevenueResults().contains(projectName)
                    revenuePage.getRevenueResults().contains(projectDetails.honorariumAmount)
                    revenuePage.getRevenueResults().contains(projectDetails.feeAmountField)
                })

    })
})

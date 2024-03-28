import generator from '../../../support/generator'
import ExpertsPaymentsPage from '../../../pageObjects/ExpertsPaymentsPage'

describe('Accounting changing the Expert Payments status', { tags: "regression" }, function () {
    let testUsers,
        expertFullName,
        projectId,
        localStorage,
        eplId,
        segmentId,
        authToken,
        expertId,
        delieveredBy,
        projectDetails

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const expertsPaymentsPage = new ExpertsPaymentsPage()

    before(function () {
        cy.intercept('POST', '**/calendar-service/schedule').as('schedule')
        cy.intercept('POST', '**/api/project/**/zoom-meetings').as('zoomMeeting')
        cy.intercept('GET', '**/email-template/group/**').as('emailTemplate')
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName}`
        })
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.accounting.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                localStorage = quickLoginResponse.body
                authToken = quickLoginResponse.body.token
                cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName).then(
                            addAndInviteExpertToProjectFromAPIResponse => {
                                eplId = addAndInviteExpertToProjectFromAPIResponse.body.id

                                // Add Fee and hono
                                cy.fixture('projectDetails').then(projectDetailsFixture => {
                                    projectDetails = projectDetailsFixture
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

                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
            })
        })

    })

    it('Should check the status is Reviewing payment details', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/expert-payments`)
        expertsPaymentsPage.getSearchField(projectName)
        expertsPaymentsPage.getPaymentsRows().should('have.length', 1)

        expertsPaymentsPage.getExpertName().should('have.text', expertFullName)
        expertsPaymentsPage.getProjectName().should('have.text', projectName)
        expertsPaymentsPage.getPaymentStatus().should('contain', 'Reviewing payment details')
    })

    it('Should change the payment status to Collecting payment details', function () {
        expertsPaymentsPage.getPaymentsRows().should('have.length', 1)

        expertsPaymentsPage.getPaymentCheckBox().click()
        expertsPaymentsPage.getPaymentStatusAction('Collecting payment details').click()
        expertsPaymentsPage.getPaymentStatusApplyButton().click()

        expertsPaymentsPage.getExpertName().should('have.text', expertFullName)
        expertsPaymentsPage.getProjectName().should('have.text', projectName)
        expertsPaymentsPage.getPaymentStatus().should('contain', 'Collecting payment details')
    })

    it('Should change the payment status to Processing payment', function () {
        expertsPaymentsPage.getPaymentsRows().should('have.length', 1)

        expertsPaymentsPage.getPaymentCheckBox().click()
        expertsPaymentsPage.getPaymentStatusAction('Processing payment').click()
        expertsPaymentsPage.getPaymentStatusApplyButton().click()

        expertsPaymentsPage.getExpertName().should('have.text', expertFullName)
        expertsPaymentsPage.getProjectName().should('have.text', projectName)
        expertsPaymentsPage.getPaymentStatus().should('contain', 'Processing payment')
    })

    it('Should change the payment status to Paid', function () {
        expertsPaymentsPage.getPaymentsRows().should('have.length', 1)

        expertsPaymentsPage.getPaymentCheckBox().click()
        expertsPaymentsPage.getPaymentStatusAction('Paid').click()
        expertsPaymentsPage.getPaymentStatusApplyButton().click()

        expertsPaymentsPage.getExpertName().should('have.text', expertFullName)
        expertsPaymentsPage.getProjectName().should('have.text', projectName)
        expertsPaymentsPage.getPaymentStatus().should('contain', 'Paid')
    })
})

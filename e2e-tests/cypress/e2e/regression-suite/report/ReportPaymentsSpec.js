import generator from '../../../support/generator'
import PaymentsPage from '../../../pageObjects/PaymentsPage'

describe('Check Revenues report as Team Leader', { tags: "regression" }, function () {
    let authInfo,
        projectId,
        authToken,
        testUsers,
        eplId,
        segmentId,
        projectDetails,
        expertId,
        delieveredBy,
        feesId,
        invoicingEntityId,
        atheneumOfficeId,
        invoiceId,
        parentAccountId,
        accountId,
        paidInvoiceNo,
        paidConvertedAmount,
        paidAmount,
        paymentId,
        paymentStatus,
        parentAccount,
        dateOnPaymentReport

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const paymentsPage = new PaymentsPage()
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const startDate = `${generator.returnFirstDateOfCurrentMonth()}`

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

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.fixture('projectDetails').then(projectDetailsFixture => {
                projectDetails = projectDetailsFixture

                cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        segmentId = projectCreateResponse.body.segmentId
                        parentAccountId = projectCreateResponse.body.parentAccountId
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

                cy.requestLogIn(
                    testUsers.accounting.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    authToken = quickLoginResponse.body.token
                    authInfo = quickLoginResponse
                    cy.requestGetProjectDeliverablesForPAYG(authToken, projectId).then(
                        getProjectDeliverablesForPAYGResponse => {
                            feesId = getProjectDeliverablesForPAYGResponse.body[0].fees[0].id
                            atheneumOfficeId = getProjectDeliverablesForPAYGResponse.body[0].fees[0].project.atheneumOfficeId
                        })
                    cy.requestGetInvoiceEntity(authToken, parentAccountId, accountId).then(
                        getInvoiceEntityResponse => {
                            invoicingEntityId = getInvoiceEntityResponse.body[0].id
                        })
                    cy.fixture('objects/draftInvoiceObject').then(draftInvoiceObject => {
                        draftInvoiceObject.invoicingEntityId = invoicingEntityId
                        draftInvoiceObject.projectId = projectId
                        draftInvoiceObject.fees[0].id = feesId
                        draftInvoiceObject.atheneumOfficeId = atheneumOfficeId
                        cy.requestInvoiceDraft(authToken, draftInvoiceObject).then(
                            invoicetCreateResponse => {
                                invoiceId = invoicetCreateResponse.body.id
                                cy.requestInvoiceApproved(authToken, invoiceId)
                                cy.fixture('objects/createInvoiceObject').then(createInvoiceObject => {
                                    createInvoiceObject.sentDate = todaysDate
                                    createInvoiceObject.dueDate = todaysDate
                                    createInvoiceObject.documentDate = todaysDate
                                    cy.requestInvoiceCreated(authToken, invoiceId, createInvoiceObject)
                                    cy.fixture('objects/invoicePaymentsObject').then(invoicePaymentsObject => {
                                        invoicePaymentsObject.invoicePayments[0].paidDate = todaysDate
                                        invoicePaymentsObject.invoicePayments[0].amount = projectDetails.feeAmountField
                                        cy.requestInvoicePayments(authToken, invoiceId, invoicePaymentsObject).then(invoicePaidResponse => {
                                            paidInvoiceNo = invoicePaidResponse.body.name
                                            paidConvertedAmount = invoicePaidResponse.body.invoicePayments[0].convertedAmount
                                            paidAmount = invoicePaidResponse.body.invoicePayments[0].amount
                                            paymentId = invoicePaidResponse.body.invoicePayments[0].id
                                            paymentStatus = invoicePaidResponse.body.invoicePayments[0].invoicePaymentStatus.name
                                            dateOnPaymentReport = `${generator.generateMonthnameDDYYYY()}`
                                            parentAccount = invoicePaidResponse.body.invoiceImmutableData.invoicingEntityLegalName
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
        cy.intercept('POST', '**/api/payment').as('waitForPaymentDetails')
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/payments`)
    })

    it('Should show paid payments for PAYG invoice type under payments report', function () {
        paymentsPage.getClearSearchBtn().click()
        paymentsPage.selectEndDate()
        cy.wait('@waitForPaymentDetails')
            .its('response.statusCode')
            .should('eq', 200)
        cy.requestPaymentReports(authToken, startDate, todaysDate).then(paymentReportResult => {
            paymentsPage.getPaymentsResults().should('have.length', paymentReportResult.body.length)
            paymentsPage.getInvoiceNo().contains(paidInvoiceNo)
            paymentsPage.getPaymentInvoiceType().contains('PAYG')
            paymentsPage.getPaymentConvertedAmount().contains(paidConvertedAmount)
            paymentsPage.getPaymentAmount().contains(paidAmount)
            paymentsPage.getClientAccount().contains(parentAccount)
            paymentsPage.getPaymentId().contains(paymentId)
            paymentsPage.getPaymentStatus().contains(paymentStatus)
            paymentsPage.getPaymentDate().contains(dateOnPaymentReport)
        })
    })
})

import generator from '../../../support/generator'
import GlobalPage from '../../../pageObjects/GlobalPage'
import DraftedInvoiceSearchPage from '../../../pageObjects/DraftedInvoiceSearchPage'


describe('Accounting changing the Created Invoice status', { tags: ["regression", "smoke"] }, function () {
    let testUsers,
        projectId,
        localStorage,
        projectDetails,
        accountId,
        parentAccountId,
        authToken,
        feesId,
        invoicingEntityId,
        atheneumOfficeId,
        startDate,
        invoiceId,
        createdInvoiceNo,
        subjectOfMail,
        contentOfMail,
        eplId,
        segmentId,
        expertId,
        delieveredBy

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const globalPage = new GlobalPage()
    const draftedInvoiceSearchPage = new DraftedInvoiceSearchPage()
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`

    before(function () {
        cy.intercept('POST', '**/calendar-service/schedule').as('schedule')
        cy.intercept('POST', '**/api/project/**/zoom-meetings').as('zoomMeeting')
        cy.intercept('GET', '**/email-template/group/**').as('emailTemplate')

        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
        })
        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                accountId = projectCreateResponse.body.accountId
                parentAccountId = projectCreateResponse.body.parentAccountId

                cy.fixture('projectDetails').then(projectDetailsFixture => {
                    projectDetails = projectDetailsFixture
                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        cy.setLocalStorageLoginInfo(quickLoginResponse.body.user, quickLoginResponse.body.token)
                        authToken = quickLoginResponse.body.token

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
                    })

                    cy.requestLogIn(
                        testUsers.accounting.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        authToken = quickLoginResponse.body.token
                        localStorage = quickLoginResponse.body
                        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
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
                                    })
                                })
                        })
                    })
                    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/created-invoices`)
                })
            })

    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        globalPage.getClearSearchButton().click()
    })

    it('Should check count of created invoices with all status', function () {
        startDate = `${generator.returnFirstDateOfCurrentMonth()}`
        cy.fixture('objects/createInvoiceSearchObject').then(createInvoiceSearchObject => {
            createInvoiceSearchObject.startDate = startDate
            createInvoiceSearchObject.endDate = todaysDate
            createInvoiceSearchObject.sentStatus = "all"
            createInvoiceSearchObject.unpaidOnly = false
            cy.requestInvoiceSearchData(authToken, createInvoiceSearchObject).then(
                invoiceSearchResult => {
                    draftedInvoiceSearchPage.getInvoiceResults()
                        .should('have.length', invoiceSearchResult.body.invoices.length)
                })
        })

    })

    it('Should search created invoice with Invoice No, status as Created and Not sent', function () {
        draftedInvoiceSearchPage.selectStatus('Created')
        cy.requestGetInvoiceData(authToken, invoiceId).then(invoicetCreatedResponse => {
            createdInvoiceNo = invoicetCreatedResponse.body.name
            draftedInvoiceSearchPage.getInvoiceNoField().type(`${createdInvoiceNo}{enter}`)
            cy.fixture('objects/createInvoiceSearchObject').then(createInvoiceSearchObject => {
                createInvoiceSearchObject.startDate = startDate
                createInvoiceSearchObject.endDate = todaysDate
                createInvoiceSearchObject.sentStatus = "not_sent"
                createInvoiceSearchObject.unpaidOnly = false
                createInvoiceSearchObject.invoiceNo = createdInvoiceNo
                createInvoiceSearchObject.invoiceStatus = 4
                cy.requestInvoiceSearchData(authToken, createInvoiceSearchObject).then(
                    invoiceSearchResult => {
                        draftedInvoiceSearchPage.getInvoiceResults()
                            .should('have.length', invoiceSearchResult.body.invoices.length)
                        draftedInvoiceSearchPage.getInvoiceResults().contains(createdInvoiceNo)
                        draftedInvoiceSearchPage.getInvoiceResults().contains("Created")
                    })
            })
        })

    })

    it('Should send the created invoice and check with created and sent', function () {

        cy.requestSendInvoiceData(authToken, invoiceId).then(sendInvoiceDataResponse => {
            subjectOfMail = sendInvoiceDataResponse.body.template.subject
            contentOfMail = sendInvoiceDataResponse.body.template.content
            cy.fixture('objects/sendInvoiceObject').then(sendInvoiceObject => {
                sendInvoiceObject.subject = subjectOfMail
                sendInvoiceObject.content = contentOfMail
                cy.sendInvoice(authToken, invoiceId, sendInvoiceObject)
                draftedInvoiceSearchPage.selectStatus('Created')
                draftedInvoiceSearchPage.selectSentToClientStatus('Sent')
                cy.requestGetInvoiceData(authToken, invoiceId).then(invoicetCreatedResponse => {
                    createdInvoiceNo = invoicetCreatedResponse.body.name
                    draftedInvoiceSearchPage.getInvoiceNoField().type(`${createdInvoiceNo}{enter}`)
                    cy.fixture('objects/createInvoiceSearchObject').then(createInvoiceSearchObject => {
                        createInvoiceSearchObject.startDate = startDate
                        createInvoiceSearchObject.endDate = todaysDate
                        createInvoiceSearchObject.sentStatus = "sent"
                        createInvoiceSearchObject.unpaidOnly = true
                        createInvoiceSearchObject.invoiceNo = createdInvoiceNo
                        createInvoiceSearchObject.invoiceStatus = 4
                        cy.requestInvoiceSearchData(authToken, createInvoiceSearchObject).then(
                            invoiceSearchResult => {
                                draftedInvoiceSearchPage.getInvoiceResults()
                                    .should('have.length', invoiceSearchResult.body.invoices.length)
                                draftedInvoiceSearchPage.getInvoiceResults().contains(createdInvoiceNo)
                                draftedInvoiceSearchPage.getInvoiceResults().contains("Created")
                            })
                    })
                })

            })
        })
    })

    it('Should paid the created invoice and check with paid and sent', function () {
        cy.fixture('objects/invoicePaymentsObject').then(invoicePaymentsObject => {
            invoicePaymentsObject.invoicePayments[0].paidDate = startDate
            invoicePaymentsObject.invoicePayments[0].amount = projectDetails.feeAmountField
            cy.requestInvoicePayments(authToken, invoiceId, invoicePaymentsObject)
            draftedInvoiceSearchPage.selectStatus('Paid')
            draftedInvoiceSearchPage.selectSentToClientStatus('Sent')
            cy.requestGetInvoiceData(authToken, invoiceId).then(invoicetCreatedResponse => {
                createdInvoiceNo = invoicetCreatedResponse.body.name
                draftedInvoiceSearchPage.getInvoiceNoField().type(`${createdInvoiceNo}{enter}`)
                cy.fixture('objects/createInvoiceSearchObject').then(createInvoiceSearchObject => {
                    createInvoiceSearchObject.startDate = startDate
                    createInvoiceSearchObject.endDate = todaysDate
                    createInvoiceSearchObject.sentStatus = "sent"
                    createInvoiceSearchObject.unpaidOnly = false
                    createInvoiceSearchObject.invoiceNo = createdInvoiceNo
                    createInvoiceSearchObject.invoiceStatus = 6
                    cy.requestInvoiceSearchData(authToken, createInvoiceSearchObject).then(
                        invoiceSearchResult => {
                            draftedInvoiceSearchPage.getInvoiceResults()
                                .should('have.length', invoiceSearchResult.body.invoices.length)
                            draftedInvoiceSearchPage.getInvoiceResults().contains(createdInvoiceNo)
                            draftedInvoiceSearchPage.getInvoiceResults().contains("Paid")
                        })
                })
            })
        })
    })
})

import generator from '../../../support/generator'
import FinancialRevenuePage from '../../../pageObjects/FinancialRevenuePage'
import GlobalPage from '../../../pageObjects/GlobalPage'


describe('Check Financial Revenues report as Accounting employee', { tags: "regression" }, function () {
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
        feeId,
        invoicingEntityId,
        atheneumOfficeId,
        invoiceId,
        parentAccountId,
        accountId,
        testData,
        atheneumCode,
        invoiceNo,
        reportDetails

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const financialRevenuePage = new FinancialRevenuePage()
    const globalPage = new GlobalPage()
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
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
                    cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.financialRevenueOfficeName).then(
                        projectCreateResponse => {
                            projectId = projectCreateResponse.body.id
                            segmentId = projectCreateResponse.body.segmentId
                            parentAccountId = projectCreateResponse.body.parentAccountId
                            accountId = projectCreateResponse.body.accountId
                            atheneumCode = projectCreateResponse.body.atheneumCode
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
                                                            feeId = createdFeeResponse.body.id
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
        cy.intercept('GET', '**/api/report/financial-revenue**').as('waitForFinancialRevenueDetails')
        cy.intercept('POST', '**/api/accounting-adjustment').as('waitForAdjustmentDetails')
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    })

    it('Should show financial revenues for all accounts for today', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/financial-revenue`)
        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
            })
    })

    it('Should show financial revenues for specific parent account and account for today', function () {
        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectParentAccount(testData.financialRevenueParentAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectAccount(testData.financialRevenueAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, parentAccountId, accountId)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
            })
    })

    it('Should show financial revenues for Contract Type as No Contract', function () {
        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectParentAccount(testData.financialRevenueParentAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectAccount(testData.financialRevenueAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('No contract').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, parentAccountId, accountId, 0)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
            })
    })

    it('Should show financial revenues for Entry Type as Unallocated fees', function () {
        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectParentAccount(testData.financialRevenueParentAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectAccount(testData.financialRevenueAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('No contract').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('Unallocated fees').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, parentAccountId, accountId, 0, reportDetails.entryTypesFeeUnallocated)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
                financialRevenuePage.getEntryColumn().should('contain.text', 'Fee - ' + feeId)
                financialRevenuePage.getAccountNameColumn().should('contain.text', testData.financialRevenueAccountName)
                financialRevenuePage.getProjectNameColumn().should('contain.text', projectName)
                financialRevenuePage.getProjectStatus().should('contain.text', 'Open')
                financialRevenuePage.getProjectCode().contains(atheneumCode)
                financialRevenuePage.getDelieveryDate().contains(dateOnRevenueReport)
                financialRevenuePage.getFeeColumn().contains(parseInt(projectDetails.feeAmountField))
                financialRevenuePage.getUnallocatedColumn().contains(0 - parseInt(projectDetails.feeAmountField))
            })
    })

    it('Should show financial revenues for Entry Type as Allocated fees', function () {
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
                })
        })
        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectParentAccount(testData.financialRevenueParentAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectAccount(testData.financialRevenueAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('No contract').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('Allocated fees').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, parentAccountId, accountId, 0, reportDetails.entryTypesFeeAllocated)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
                financialRevenuePage.getEntryColumn().should('contain.text', 'Fee - ' + feeId)
                financialRevenuePage.getAccountNameColumn().should('contain.text', testData.financialRevenueAccountName)
                financialRevenuePage.getProjectNameColumn().should('contain.text', projectName)
                financialRevenuePage.getProjectStatus().should('contain.text', 'Open')
                financialRevenuePage.getProjectCode().contains(atheneumCode)
                financialRevenuePage.getDelieveryDate().contains(dateOnRevenueReport)
                financialRevenuePage.getFeeColumn().contains(parseInt(projectDetails.feeAmountField))
                financialRevenuePage.getUnallocatedColumn().contains('-')
                financialRevenuePage.getNotInvoicedIcon().should('exist')
                financialRevenuePage.getAllocatedIcon().should('exist')
            })
    })


    it('Should show financial revenues for Entry Type as Invoices', function () {
        cy.requestInvoiceApproved(authToken, invoiceId)
        cy.fixture('objects/createInvoiceObject').then(createInvoiceObject => {
            createInvoiceObject.sentDate = todaysDate
            createInvoiceObject.dueDate = todaysDate
            createInvoiceObject.documentDate = todaysDate
            cy.requestInvoiceCreated(authToken, invoiceId, createInvoiceObject)
                .then(invoiceCreatedResponse => {
                    invoiceNo = invoiceCreatedResponse.body.invoiceItems[0].invoiceId
                })
        })

        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectParentAccount(testData.financialRevenueParentAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectAccount(testData.financialRevenueAccountName)
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('No contract').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('Allocated fees').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, parentAccountId, accountId, 0, reportDetails.entryTypesFeeAllocated)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
                financialRevenuePage.getEntryColumn().should('contain.text', 'Fee - ' + feeId)
                financialRevenuePage.getAccountNameColumn().should('contain.text', testData.financialRevenueAccountName)
                financialRevenuePage.getProjectNameColumn().should('contain.text', projectName)
                financialRevenuePage.getProjectStatus().should('contain.text', 'Open')
                financialRevenuePage.getProjectCode().contains(atheneumCode)
                financialRevenuePage.getDelieveryDate().contains(dateOnRevenueReport)
                financialRevenuePage.getFeeColumn().contains(parseInt(projectDetails.feeAmountField))
                financialRevenuePage.getUnallocatedColumn().contains('-')
                financialRevenuePage.getAllocatedInvoiceIcon().should('exist')
                financialRevenuePage.getAllocatedIcon().should('exist')
            })
        financialRevenuePage.getCheckbox('Allocated fees').uncheck()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('Invoices').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, parentAccountId, accountId, 0, reportDetails.entryTypesInvoice)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
                financialRevenuePage.getEntryColumn().should('contain.text', 'Invoice - ' + invoiceNo)
                financialRevenuePage.getAccountNameColumn().should('contain.text', testData.financialRevenueAccountName)
                financialRevenuePage.getProjectNameColumn().should('contain.text', projectName)
                financialRevenuePage.getProjectStatus().should('contain.text', 'Open')
                financialRevenuePage.getProjectCode().contains(atheneumCode)
                financialRevenuePage.getDocumentDate().contains(dateOnRevenueReport)
                financialRevenuePage.getInvoicedAmount().contains(parseInt(projectDetails.feeAmountField))
                financialRevenuePage.getFinancialRevenueField().contains(parseInt(projectDetails.feeAmountField))
            })
    })

    it('Should show financial revenues for created general adjustments', function () {
        financialRevenuePage.getAction('Create general adjustment').click()
        financialRevenuePage.selectDocumentDate()
        financialRevenuePage.getGeneralAdjustmentAmount().type(reportDetails.generalFeeAdjustmentAmount)
        financialRevenuePage.selectCurrency('EUR')
        globalPage.submitButton().click()
        cy.wait('@waitForAdjustmentDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getClearSearchBtn().click()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.selectStartDate()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        financialRevenuePage.getCheckbox('General adjustments').check()
        cy.wait('@waitForFinancialRevenueDetails').its('response.statusCode').should('eq', 200)
        cy.requestGetFinancialRevenue(authToken, todaysDate, todaysDate, 0, 0, 0, reportDetails.entryTypesAdjustmentGeneral)
            .then(financialRevenueResponse => {
                financialRevenuePage.getTotalResults().should('have.length', financialRevenueResponse.body.rows.length)
                financialRevenuePage.getGeneralFeeAdjEntryColumn().should('contain.text', 'Gen. adj. - ' + financialRevenueResponse.body.rows[0].id)
                financialRevenuePage.getDocumentDate().contains(dateOnRevenueReport)
                financialRevenuePage.getAdjustmentColumn().contains(parseInt(reportDetails.generalFeeAdjustmentAmount))
                financialRevenuePage.getFinancialRevenueField().contains(parseInt(reportDetails.generalFeeAdjustmentAmount))
            })
    })
})

import generator from '../../../support/generator'
import InvoicePage from '../../../pageObjects/InvoicePage'
import GlobalPage from '../../../pageObjects/GlobalPage'

describe('Create Invoice as Team Leader', { tags: "regression" }, function () {
    let contractID,
        projectId,
        authToken,
        localStorage,
        segmentId,
        testData,
        invoiceTestData,
        projectDetails,
        parentAccountId,
        eplId,
        expertId,
        delieveredBy,
        Contractname


    const invoicePage = new InvoicePage()
    const globalPage = new GlobalPage()
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const startDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const endDate = `${generator.returnNextMonthDateinYYYYMMDDFormat()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const uniqueid = `${generator.generateUniqueIDForClient()}`
    let expertData = generator.generateExpertNames(1)[0]

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.accounting.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
                localStorage = loginResponse.body
                cy.setLocalStorageLoginInfo(localStorage, authToken)
            })
        })

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

                            cy.fixture('createContractAPIData').then(createContractAPI => {
                                createContractAPI.projects[0].id = projectId
                                createContractAPI.parentAccountId = parentAccountId
                                createContractAPI.startDate = startDate
                                createContractAPI.endDate = endDate
                                cy.requestCreateContract(authToken, createContractAPI).then(
                                    createContractAPIResponse => {
                                        contractID = createContractAPIResponse.body.id
                                        Contractname = createContractAPIResponse.body.contractReference

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
                                                        cy.fixture('objects/feeObjectForcontract').then(feeObjectForContract => {
                                                            feeObjectForContract.expertProjectLinkId = eplId
                                                            feeObjectForContract.expertId = expertId
                                                            feeObjectForContract.projectId = projectId
                                                            feeObjectForContract.contractId = contractID
                                                            feeObjectForContract.deliveredBy = delieveredBy
                                                            feeObjectForContract.deliveryDate = todaysDate
                                                            feeObjectForContract.feeItems[0].value = projectDetails.feeAmountField
                                                            feeObjectForContract.feeItems[1].value = projectDetails.honorariumAmount
                                                            cy.requestPostFee(authToken, feeObjectForContract)
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
        cy.fixture('testData').then(testusers => {
            testData = testusers
        })
        cy.fixture('invoiceTestData').then(invoicetestdata => {
            invoiceTestData = invoicetestdata
        })
    })
    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage, authToken)
        cy.intercept('POST', '**/api/invoice').as('SaveInvoice')
        cy.intercept('GET', '**/sherlock/api/comment?expertId=*').as('ApproveRequest')
        cy.intercept('GET', '**/api/invoice/*').as('InvoiceItem')
        cy.intercept('POST', '**/credit-note').as('postCreateCreditNoteCall')
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/invoice/update-status`).as('postCAPIInvoiceUpdate')
        cy.intercept('GET', `**/api/contract/${contractID}/deliverables`).as('addFee')
        cy.intercept('GET', `sherlock/api/comment?expertId=*`).as('saveAddFee')

    })

    it('Should Create Invoice through Draft New Inovice Button', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/contract/${contractID}/invoice`)
        invoicePage.getDraftInvoiceButton().click()
        invoicePage.selectInvoiceEntity(testData.accountName)
        invoicePage.selectAtheneumOffice(invoiceTestData.atheneumOffice)
        invoicePage.getVatInputField().type(invoiceTestData.VAT)
        invoicePage.selectCurrency(invoiceTestData.currency)
        invoicePage.getCaseCodeField().type(invoiceTestData.caseCode)
        invoicePage.getSaveBtnOnInvoice().click()
        invoicePage.getAddFeesTitle()
            .then(invoice => {

                expect(invoice.text()).to.eql('Add invoice items')
            })
        invoicePage.getnetAmountDescription().type('Test Amount')
        invoicePage.getnetAmountValue().type('800')
        invoicePage.getSaveBtnAddInvoiceItem().click()
        cy.wait('@SaveInvoice').its('response.statusCode').should('equal', 200)

        // Reqeust Approval
        invoicePage.getInvoice().click()
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Draft')
        invoicePage.getRequestApprovalBtn().click()
        invoicePage.getApproveRequest().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Waiting for approval ')

        // Disapprove
        invoicePage.getDisapproveBtn().click()
        invoicePage.getDisapprovalReason().type('Disapprove')
        invoicePage.getSendButton().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Draft')

        // Approve Invoice
        invoicePage.getRequestApprovalBtn().click()
        invoicePage.getApproveRequest().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Waiting for approval ')
        invoicePage.getApproveBtn().click()
        invoicePage.getApproveConfirmBtn().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Approved')

        // Disapprove
        invoicePage.getDisapproveBtn().click()
        invoicePage.getDisapprovalReason().type('Disapprove')
        invoicePage.getSendButton().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Draft')

        // Edit Case Code
        invoicePage.getCaseCodeOnDetails().should('have.text', 'A1')
        invoicePage.getEditInvoiceBtn().click()
        invoicePage.getCaseCodeField().type('A2')
        invoicePage.getSaveBtnOnInvoice().click()
        cy.wait('@ApproveRequest')
        invoicePage.getCaseCodeOnDetails().should('have.text', 'A1A2')

        //Deleting Invoice Items
        invoicePage.getDeleteIcon().click()
        invoicePage.getApproveConfirmBtn().click()
        cy.wait('@ApproveRequest')
        invoicePage.getDeleteIcon().should('not.exist')

        // Add Invoice Item
        invoicePage.getAddInvoiceItemsBtn().click()
        invoicePage.getnetAmountDescription().type('Test Amount')
        invoicePage.getnetAmountValue().type('800')
        invoicePage.getSaveBtnAddInvoiceItem().click()
        cy.wait('@InvoiceItem')
        cy.wait('@ApproveRequest')
        cy.wait(2000)

        // Delete Invoice
        invoicePage.getDeleteBtn().click()
        invoicePage.getApproveConfirmBtn().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('not.exist')
    })

    it('Should Create Invoice through Draft New Inovice Icon', function () {

        invoicePage.getDraftInvoiceIcon().click()
        invoicePage.selectInvoiceEntity(testData.accountName)
        invoicePage.selectAtheneumOffice(invoiceTestData.atheneumOffice)
        invoicePage.getVatInputField().type(invoiceTestData.VAT)
        invoicePage.selectCurrency(invoiceTestData.currency)
        invoicePage.getCaseCodeField().type(invoiceTestData.caseCode)
        invoicePage.getSaveBtnOnInvoice().click()
        invoicePage.getAddFeesTitle()
            .then(invoice => {

                expect(invoice.text()).to.eql('Add invoice items')
            })
        invoicePage.getnetAmountDescription().type('Test Amount')
        invoicePage.getnetAmountValue().type('10000000000001')
        invoicePage.getSaveBtnAddInvoiceItem().click()
        invoicePage.getInputError().should('contain.text', 'Cannot set a value larger than 1.000.000.000.000,00')
        invoicePage.getnetAmountValue().clear().type('800')
        invoicePage.getSaveBtnAddInvoiceItem().click()
        cy.wait('@SaveInvoice').its('response.statusCode').should('equal', 200)
        invoicePage.getInvoice().click()
        invoicePage.getApproveBtn().click()
        invoicePage.getApproveConfirmBtn().click()
        cy.wait('@ApproveRequest')
        invoicePage.getInvoiceStatusLabel().should('have.text', 'Approved')
        cy.wait(1000)
        invoicePage.getCreateInvoice().click()
        invoicePage.getSendDate().click()
        invoicePage.getTodayDate().click()
        invoicePage.getDocumentDate().click()
        invoicePage.getTodayDate().click()
        globalPage.submitButton().click()
        invoicePage.getShowInvoicedFee().click()
        invoicePage.getAddFee().click()
        cy.wait('@addFee')
        invoicePage.getSelectFeeType().click()
        globalPage.submitButton().click()
        cy.wait('@saveAddFee')
        invoicePage.getAddedFee().should('contain.text', projectDetails.feeAmountField)
        cy.wait(2000)
        invoicePage.getAddPaymentButton().click()

        invoicePage.getDatePicker().click()
        invoicePage.getTodayDate().click()
        invoicePage.getInvoiceTextField().type('1000000000000')
        invoicePage.getInvoiceWarning().should('contain.text', 'Paid amount exceeds the invoice amount.')
        invoicePage.getInvoiceTextField().clear().type('900')
        invoicePage.getSendButton().click()
        invoicePage.getInvoicePayment().first().should('contain.text', '900')
        invoicePage.getInvoicePayment().last().should('contain.text', 800 - 900)

    })
})

import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import InvoicePage from '../../../pageObjects/InvoicePage'

describe('Creating invoice as Accounting Officer', { tags: ["regression", "smoke"] }, function () {
    let testUsers,
        projectId,
        localStorage,
        projectDetails,
        interviewDate,
        testData,
        invoiceNo,
        creditNoteNo,
        createdInvoiceNo,
        invoiceTestData,
        totalGrossAmount,
        totalVATAmount,
        eplId,
        segmentId,
        authToken,
        expertId,
        delieveredBy

    let expertData = generator.generateExpertNames(1)[0]

    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const globalPage = new GlobalPage()
    const invoicePage = new InvoicePage()

    function generateGrossAmount(amount, VATPercentage) {
        let number = ((parseInt(amount) * parseInt(VATPercentage)) / 100) + parseInt(amount)
        return number
    }

    function generateVATAmount(amount, VATPercentage) {
        let number = (parseInt(amount) * parseInt(VATPercentage)) / 100
        return number
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
        })
        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('projectDetails').then(projectDetailsFixture => {
                    projectDetails = projectDetailsFixture
                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        authToken = quickLoginResponse.body.token
                        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                            expertCreateObject.firstName = expertData.firstName
                            expertCreateObject.lastName = expertData.lastName
                            expertCreateObject.originalName = expertData.originalName
                            expertCreateObject.email = expertData.email
                            cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                                expertCreateResponse => {
                                    expertData.expertId = expertCreateResponse.body.id
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
                                                                cy.requestPostFee(authToken, feeObject)
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                }
                            )
                        })

                        cy.setLocalStorageLoginInfo(quickLoginResponse.body.user, quickLoginResponse.body.token)
                        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
                        cy.waitForLoadingDisappear()
                    })
                    cy.checkEPLStatus(expertData.originalName, 'Interviewed')
                    expertInvitePage.getDateOnEpl().should('be.visible').then($el => {
                        interviewDate = $el.text()
                    })

                    cy.requestLogIn(
                        testUsers.accounting.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        localStorage = quickLoginResponse.body
                        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
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
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

        cy.intercept('POST', '**/api/invoice').as('postInvoiceCall')
        cy.intercept('PUT', '**/request-approval').as('putRequestApprovalInvoiceCall')
        cy.intercept('PUT', '**/api/invoice/*').as('putEditInvoiceCall')
        cy.intercept('PUT', '**/disapprove').as('putDisapproveInvoiceCall')
        cy.intercept('DELETE', '**/api/invoice/*').as('deleteInvoiceCall')
        cy.intercept('PUT', '**/approve').as('putApproveInvoiceCall')
        cy.intercept('PUT', '**/created-status').as('putCreateInvoiceCall')
        cy.intercept('POST', '**/send-invoice').as('postSendInvoiceCall')
        cy.intercept('POST', '**/credit-note').as('postCreateCreditNoteCall')
        cy.intercept('GET', '**/api/employee/**').as('getEmployee')
    })

    it('Should verify unallocated fee under invoice tab', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/invoice`)
        invoicePage.getUnallocatedFeeHeading().should('have.text', 'Unallocated fees')
        invoicePage.getUnallocatedAmount().should('include.text', invoiceTestData.currency)
        invoicePage.getUnallocatedAmount().should('include.text', projectDetails.feeAmountField)
        invoicePage.getUnallocatedFeeType().should('include.text', invoiceTestData.feeType)
        invoicePage.getUnallocatedFeeType().should('include.text', invoiceTestData.delieverable + ' - ' + expertData.originalName)
        invoicePage.getUnallocatedDelieveryDate().should('have.text', interviewDate)
    })

    it('Should draft new invoice for unallocated fees', function () {
        invoicePage.getDraftInvoiceButton().click()
        invoicePage.selectInvoiceEntity(testData.accountName)
        invoicePage.selectAtheneumOffice(invoiceTestData.atheneumOffice)
        invoicePage.getVatInputField().type(invoiceTestData.VAT)
        invoicePage.selectCurrency(invoiceTestData.currency)
        invoicePage.getCaseCodeField().type(invoiceTestData.caseCode)
        invoicePage.getSaveBtnOnInvoice().click()
        invoicePage.getAddFeesTitle().should('have.text', 'Add fees')
        invoicePage.getFeeAllocateToInvoiceTitle().should('have.text', 'Select fees to be allocated to the invoice ')
        invoicePage.getDelieveryDate().should('have.text', interviewDate)
        invoicePage.getAmount().should('include.text', projectDetails.feeAmountField)
        invoicePage.getAmount().should('include.text', invoiceTestData.currency)
        invoicePage.getFeeType().should('include.text', invoiceTestData.feeType)
        invoicePage.getFeeType().should('include.text', invoiceTestData.delieverable + ' - ' + expertData.originalName)
        invoicePage.selectFeesToAllocateToInvoice().check()
        invoicePage.getSaveBtnOnInvoice().click()

        cy.wait('@postInvoiceCall').its('response.statusCode').should('equal', 200)

        invoicePage.getStatus().should('have.text', invoiceTestData.createdIvoiceStatus)
        invoicePage.getNetAmount().should('include.text', invoiceTestData.currency)
        invoicePage.getNetAmount().should('include.text', projectDetails.feeAmountField)
        invoicePage.getAtheneumCompany().should('have.text', invoiceTestData.atheneumOffice)
        invoicePage.getInvoiceNo().then($el => {
            invoiceNo = $el.text()
            invoicePage.getInvoiceNo().click()
            invoicePage.getInvoiceNoOnDetails().should('have.text', invoiceNo)
            invoicePage.getStatus().should('have.text', invoiceTestData.createdIvoiceStatus)
            invoicePage.getInvoiceTypeOnDetails().should('have.text', invoiceTestData.invoiceType)
            invoicePage.getInvoiceEntityOnDetails().should('contain.text', testData.accountName)
            invoicePage.getAtheneumCompanyOnDetails().should('have.text', invoiceTestData.atheneumOffice)
            invoicePage.getVatOnDetails().should('have.text', '0,00')
            invoicePage.getCaseCodeOnDetails().should('have.text', invoiceTestData.caseCode)
            invoicePage.getCurrencyOnDetails().should('have.text', invoiceTestData.currency)
            invoicePage.getDescriptionOnDetails().should('include.text', invoiceTestData.delieverable + ' - ' + invoiceTestData.feeType + ' - 60 minutes')
            invoicePage.getUnallocatedDelieveryDate().should('have.text', interviewDate)
            invoicePage.getAmountOnDescription().should('include.text', projectDetails.feeAmountField)
            invoicePage.getAmountOnDescription().should('include.text', invoiceTestData.currency)
            invoicePage.getVATOnDescription().should('include.text', invoiceTestData.currency)
            invoicePage.getVATOnDescription().should('include.text', '0,00')
            invoicePage.getGrossAmountOnDescription().should('include.text', projectDetails.feeAmountField)
            invoicePage.getGrossAmountOnDescription().should('include.text', invoiceTestData.currency)
        })

    })
    it('Should edit created invoice', function () {
        invoicePage.getEditInvoiceBtn().click()
        invoicePage.selectAtheneumOffice(invoiceTestData.updatedAtheneumOffice)
        invoicePage.getVatInputField().clear().type(invoiceTestData.updatedVAT)
        invoicePage.getCaseCodeField().clear().type(invoiceTestData.updatedCaseCode)
        invoicePage.getHideExpertOnInvoice().check()
        invoicePage.getSaveBtnOnInvoice().click()

        cy.wait('@putEditInvoiceCall').its('response.statusCode').should('equal', 200)

        totalVATAmount = generateVATAmount(projectDetails.feeAmountField, invoiceTestData.updatedVAT)
        totalGrossAmount = generateGrossAmount(projectDetails.feeAmountField, invoiceTestData.updatedVAT)
        invoicePage.getCaseCodeOnDetails().should('have.text', invoiceTestData.updatedCaseCode)
        invoicePage.getDescriptionOnDetails().should('include.text', invoiceTestData.delieverable + ' - ' + invoiceTestData.feeType + ' - 60 minutes')
        invoicePage.getUnallocatedDelieveryDate().should('have.text', interviewDate)
        invoicePage.getAmountOnDescription().should('include.text', projectDetails.feeAmountField)
        invoicePage.getAmountOnDescription().should('include.text', invoiceTestData.currency)
        invoicePage.getVATOnDescription().should('include.text', invoiceTestData.currency)
        invoicePage.getVATOnDescription().should('include.text', totalVATAmount.toString())
        invoicePage.getGrossAmountOnDescription().should('include.text', invoiceTestData.currency)
        invoicePage.getGrossAmountOnDescription().should('include.text', totalGrossAmount.toString())
    })

    it('Should Request approval for created invoice', function () {
        invoicePage.getRequestApprovalBtn().click()
        invoicePage.getApproveConfirmation().should('include.text', invoiceNo)
        invoicePage.getApproveConfirmBtn().click()

        cy.wait('@putRequestApprovalInvoiceCall').its('response.statusCode').should('equal', 200)

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Request approval for invoice ' + invoiceNo)

        invoicePage.getStatus().should('have.text', invoiceTestData.waitingForApprovalStatus)

    })

    it('Should approve created invoice', function () {
        invoicePage.getApproveBtn().click()
        invoicePage.getApproveConfirmation().should('include.text', invoiceNo)
        invoicePage.getApproveConfirmBtn().click()

        cy.wait('@putApproveInvoiceCall').its('response.statusCode').should('equal', 200)

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Invoice ' + invoiceNo + ' approved')

        invoicePage.getStatus().should('have.text', invoiceTestData.approvedInvoiceStatus)
    })

    it('Should disapprove approved invoice', function () {
        invoicePage.getDisapproveBtn().click()
        invoicePage.getDisapproveHeading().should('include.text', invoiceNo)
        invoicePage.getDisapproveComment().type(invoiceTestData.disapproveReason)
        globalPage.submitButton().click()

        cy.wait('@putDisapproveInvoiceCall').its('response.statusCode').should('equal', 200)

        invoicePage.getDisapprovedBy().should('have.text', `${testUsers.accounting.firstName} ${testUsers.accounting.lastName}`)
        invoicePage.getDisapprovedOn().should('have.text', interviewDate)
        invoicePage.getReasonOfDisapproval().should('have.text', invoiceTestData.disapproveReason)
    })

    it('Should delete created invoice', function () {
        invoicePage.getDeleteBtn().click()
        invoicePage.getApproveConfirmation().should('have.text', invoiceTestData.messageOnDelete)
        invoicePage.getApproveConfirmBtn().click()

        cy.wait('@deleteInvoiceCall').its('response.statusCode').should('equal', 200)

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', invoiceTestData.deleteConfirmationMessage)

        invoicePage.getNoInvoiceMessage().should('have.text', invoiceTestData.noInvoiceMessage)
    })

    it('Should create approved invoice', function () {
        invoicePage.getDraftInvoiceButton().click()
        invoicePage.selectInvoiceEntity(testData.accountName)
        invoicePage.selectAtheneumOffice(invoiceTestData.atheneumOffice)
        invoicePage.getVatInputField().type(invoiceTestData.VAT)
        invoicePage.selectCurrency(invoiceTestData.currency)
        invoicePage.getCaseCodeField().type(invoiceTestData.caseCode)
        invoicePage.getSaveBtnOnInvoice().click()
        invoicePage.selectFeesToAllocateToInvoice().check()
        invoicePage.getSaveBtnOnInvoice().click()

        invoicePage.getInvoiceNo().click()
        invoicePage.getApproveBtn().click()
        invoicePage.getApproveConfirmBtn().click()

        cy.wait('@putApproveInvoiceCall').its('response.statusCode').should('equal', 200)

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Invoice ' + invoiceNo + ' approved')

        invoicePage.getCreateInvoice().click()
        invoicePage.getSendDate().click()
        invoicePage.getTodayDate().click()
        invoicePage.getDocumentDate().click()
        invoicePage.getTodayDate().click()
        globalPage.submitButton().click()

        cy.wait('@putCreateInvoiceCall').its('response.statusCode').should('equal', 200)

        invoicePage.getStatus().should('have.text', 'Created')
        invoicePage.getSendDateOnDetails().should('have.text', interviewDate)
        invoicePage.getInvoiceNoOnDetails().then($el => {
            createdInvoiceNo = $el.text()
        })
        invoicePage.getDocumentDateOnDetails().should('have.text', interviewDate)
    })

    it('Should send the created Invoice', function () {
        globalPage.getActionButtonByName('Send invoice').click()
        cy.wait('@getEmployee').its('response.statusCode').should('equal', 200)
        invoicePage.submitButton().click()

        cy.wait('@postSendInvoiceCall').its('response.statusCode').should('equal', 200)

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', 'Invoice sent')
    })

    it('Should create Credit note', function () {
        invoicePage.getCreditNoteBtn().click()
        invoicePage.getCreditNoteComment().type(invoiceTestData.creditNoteComment)
        globalPage.submitButton().click()

        cy.wait('@postCreateCreditNoteCall').its('response.statusCode').should('equal', 200)

        invoicePage.getCreditNoteCommentOnDetails().should('have.text', invoiceTestData.creditNoteComment)
        invoicePage.getInvoiceNoOnDetails().then($el => {
            creditNoteNo = $el.text()
        })
    })

    it('Should approve created Credit note', function () {
        invoicePage.getApproveBtn().click()
        invoicePage.getApproveConfirmation().should('include.text', creditNoteNo)
        invoicePage.getApproveConfirmBtn().click()

        cy.wait('@putApproveInvoiceCall').its('response.statusCode').should('equal', 200)

        invoicePage.getStatus().should('have.text', invoiceTestData.approvedInvoiceStatus)
        invoicePage.getCreditNoteForInvoice().should('have.text', createdInvoiceNo)
    })

    it('Should create approved credit note invoice', function () {
        invoicePage.getCreateInvoice().click()
        invoicePage.getSendDate().click()
        invoicePage.getTodayDate().click()
        invoicePage.getDueDate().click()
        invoicePage.getTodayDate().click()
        invoicePage.getDocumentDate().click()
        invoicePage.getTodayDate().click()
        invoicePage.getPaidDate().click()
        invoicePage.getTodayDate().click()
        globalPage.submitButton().click()

        cy.wait('@putCreateInvoiceCall').its('response.statusCode').should('equal', 200)

        invoicePage.getStatus().should('contain.text', 'Paid')
        invoicePage.getSendDateOnDetails().should('have.text', interviewDate)
        invoicePage.getInvoiceNoOnDetails().then($el => {
            createdInvoiceNo = $el.text()
        })
        invoicePage.getDocumentDateOnDetails().should('have.text', interviewDate)
    })
})

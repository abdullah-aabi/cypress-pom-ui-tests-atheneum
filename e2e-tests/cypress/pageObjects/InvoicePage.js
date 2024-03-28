class InvoicePage {
    getInvoiceInfoBox() {
        return cy.get('div.info-box-wrapper__rows')
    }

    getUnallocatedFeeHeading() {
        return cy.get('.invoice-wrapper.animate-intro h2:nth-child(4)').should('be.visible')
    }

    getInvoiceLink() {
        return cy.get('div[class*="invoice-wrapper"] a')
    }

    getUnallocatedAmount() {
        return cy.get('.invoice-table tbody tr td:nth-child(4)').should('be.visible')
    }

    getUnallocatedFeeType() {
        return cy.get('.invoice-table tbody tr td:nth-child(1)').should('be.visible')
    }

    getUnallocatedDelieveryDate() {
        return cy.get('.invoice-table tbody tr td:nth-child(2)').should('be.visible')
    }

    getDraftInvoiceButton() {
        return cy.get('.button--primary').should('be.visible')
    }

    getDraftInvoiceIcon() {
        return cy.get('.action > div').eq(0).should('be.visible')
    }

    getInvoiceEntityField() {
        return cy.get('[data-cy="invoicing-entity-autocomplete"]').should('be.visible')
    }

    getAutocompleteItems() {
        return cy
            .get('div.autocomplete__results-container [class*="autocomplete__item"]')
            .should('exist')
    }

    selectInvoiceEntity(invoicingEntity) {
        this.getInvoiceEntityField().type(invoicingEntity)
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(invoicingEntity)) {
                cy.wrap($el).click()
            }
        })
        this.getInvoiceEntityField().invoke('val').then(entityValue => {
            expect(entityValue).to.include(invoicingEntity)
        })
    }

    getnetAmountDescription() {
        return cy.get('[name="invoiceItems[0].description"]')
    }

    getnetAmountValue() {
        return cy.get('[name="invoiceItems[0].netAmount"]')
    }

    getInvoiceTitle() {
        return cy.get('.invoice-title > status-label')
    }

    getInvoice() {
        return cy.get('.text-wrapper > a').should('exist')
    }

    getAtheneumOfficeField() {
        return cy.get('[data-cy="atheneum-office-dropdown"]').should('be.visible')
    }

    selectAtheneumOffice(atheneumOffice) {
        this.getAtheneumOfficeField().click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(atheneumOffice)) {
                cy.wrap($el).click()
            }
        })
        this.getAtheneumOfficeField().should('include.text', atheneumOffice)
    }

    getVatInputField() {
        return cy.get('[name="vat"]').should('be.visible')
    }

    getCurrencyInputField() {
        return cy.get('[data-cy="currency-dropdown"]').should('be.visible')
    }

    selectCurrency(currency) {
        this.getCurrencyInputField().click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(currency)) {
                cy.wrap($el).click()
            }
        })
        this.getCurrencyInputField().should('include.text', currency)
    }

    getCaseCodeField() {
        return cy.get('[name="caseCode"]').should('be.visible')
    }

    getSaveBtnOnInvoice() {
        return cy.get('.invoice-form .button--primary').should('be.visible')
    }

    getAddInvoiceItemsBtn() {
        return cy.get('div.action').last()
    }

    getSaveBtnAddInvoiceItem() {
        return cy.get('.expert-form__section .button--primary').should('be.visible')
    }

    getAddFeesTitle() {
        return cy.get('.invoice-form h1').should('be.visible')
    }

    getFeeAllocateToInvoiceTitle() {
        return cy.get('.invoice-form h2').should('be.visible')
    }

    selectFeesToAllocateToInvoice() {
        return cy.get('.check-td input[type="checkbox"]').should('be.visible')
    }
    getDelieveryDate() {
        return cy.get('form td:nth-child(3)').should('be.visible')
    }

    getAmount() {
        return cy.get('form td:nth-child(6)').should('be.visible')
    }

    getFeeType() {
        return cy.get('form td:nth-child(2)').should('be.visible')
    }

    getStatus() {
        return cy.get('.status-label').should('be.visible')
    }

    getStatusCreated() {
        return cy.get('.status-label-created').should('be.visible')
    }

    getNetAmount() {
        return cy.get('.invoice-table tbody tr td:nth-child(4) span').should('be.visible')
    }

    getAtheneumCompany() {
        return cy.get('.invoice-table tbody tr td:nth-child(5) span').should('be.visible')
    }

    getInvoiceTitle() {
        return cy.get('h2.invoice-title > span')
    }

    getInvoiceStatusLabel() {
        return cy.get('h2.invoice-title > div')
    }

    getInvoiceNo() {
        return cy.get('.invoice-table tbody tr td:nth-child(1) span a').should('be.visible')
    }

    getInvoiceNoOnDetails() {
        return cy.get('.m-r-md').should('be.visible')
    }

    getInvoiceTypeOnDetails() {
        return cy.get('.invoice-details__item:nth-child(1) span:nth-child(2)').should('be.visible')
    }

    getInvoiceEntityOnDetails() {
        return cy.get('.invoice-details__item:nth-child(2) span:nth-child(2)').should('be.visible')
    }

    getAtheneumCompanyOnDetails() {
        return cy.get('.invoice-details__item:nth-child(3) span:nth-child(2)').should('be.visible')
    }

    getVatOnDetails() {
        return cy.get('.invoice-details__item:nth-child(4) span:nth-child(2)').should('be.visible')
    }

    getCaseCodeOnDetails() {
        return cy.get('.invoice-details__item:nth-child(5) span:nth-child(2)').should('be.visible')
    }

    getCurrencyOnDetails() {
        return cy.get('.invoice-details__item:nth-child(6) span:nth-child(2)').should('be.visible')
    }

    getDescriptionOnDetails() {
        return cy.get('.invoice-table tbody tr td:nth-child(1) span').should('be.visible')
    }

    getAmountOnDescription() {
        return cy.get('.invoice-table tbody tr td:nth-child(3) span').should('be.visible')
    }

    getVATOnDescription() {
        return cy.get('.invoice-table tbody tr td:nth-child(4) span').should('be.visible')
    }

    getGrossAmountOnDescription() {
        return cy.get('.invoice-table tbody tr td:nth-child(5) span').should('be.visible')
    }

    getEditInvoiceBtn() {
        return cy.get('[data-cy=edit-invoice-btn]').should('be.visible')
    }

    getHideExpertOnInvoice() {
        return cy.get('input[name="hideExpertName"]').should('be.visible')
    }

    getInvoicingEntity() {
        return cy.get('.invoice-details__item.link').should('be.visible')
    }

    getApproveBtn() {
        return cy.get('[data-cy="approve-invoice-btn"]').should('be.visible')
    }

    getInvoiceComments() {
        return cy.get('.invoice-group p.text').should('be.visible')
    }

    getApproveConfirmation() {
        return cy.get('#swal2-content').should('be.visible')
    }

    getApproveConfirmBtn() {
        return cy.get('button.swal2-confirm').should('be.visible')
    }

    getDisapproveBtn() {
        return cy.get('[data-cy="disapprove-invoice-btn"]').should('be.visible')
    }

    getDisapproveHeading() {
        return cy.get('form h1').should('be.visible')
    }

    getDisapproveComment() {
        return cy.get('textarea[name="disapprovalReason"]').should('be.visible')
    }

    getDisapprovedBy() {
        return cy.get('div.invoice-details__group:nth-child(2) div.invoice-details__item:nth-child(1) > span:nth-child(2)').should('be.visible')
    }

    getDisapprovedOn() {
        return cy.get('div.invoice-details__group:nth-child(2) div.invoice-details__item:nth-child(2) > span:nth-child(2)').should('be.visible')
    }

    getReasonOfDisapproval() {
        return cy.get('div.invoice-details__group:nth-child(2) div.invoice-details__item:nth-child(3) > span:nth-child(2)').should('be.visible')
    }

    getRequestApprovalBtn() {
        return cy.get('[data-cy="request-approval-btn"]').should('be.visible')
    }

    getApproveRequest() {
        return cy.get('.swal2-confirm').should('be.visible')
    }

    getDisapproveBtn() {
        return cy.get('[data-cy="disapprove-invoice-btn"] > span')
    }

    getDisapprovalReason() {
        return cy.get('[name="disapprovalReason"]')
    }

    getSendButton() {
        return cy.get('[type="submit"]').should('be.visible')
    }

    getInvoiceComment() {
        return cy.get('[name="comment"]')
    }

    getDeleteBtn() {
        return cy.get(' div.action:nth-child(4) div.action > li:nth-child(1)').should('be.visible')
    }

    getDeleteIcon() {
        return cy.get('tbody > tr > div > td > div')
    }

    getNoInvoiceMessage() {
        return cy.get('.no-content-wrapper__center div:nth-child(2)').should('be.visible')
    }

    getCreateInvoice() {
        return cy.get('[data-cy="create-invoice-btn"]').should('be.visible')
    }

    getSendDate() {
        return cy.get('div.expert-form__input-group:nth-child(1) .datepicker__wrapper input').should('be.visible')
    }

    getTodayDate() {
        return cy.get('.open .today').should('be.visible')
    }

    getDueDate() {
        return cy.get('div.expert-form__input-group:nth-child(2) .datepicker__wrapper input').should('be.visible')
    }

    getDocumentDate() {
        return cy.get('div.expert-form__input-group:nth-child(3) .datepicker__wrapper input').should('be.visible')
    }

    getPaidDate() {
        return cy.get('div.expert-form__input-group:nth-child(4) .datepicker__wrapper input').should('be.visible')
    }

    getSendDateOnDetails() {
        return cy.get('div.m-b-xl:nth-child(1) div.invoice-details__item:nth-child(1) span:nth-child(2)').should('be.visible')
    }

    getDocumentDateOnDetails() {
        return cy.get('div.m-b-xl:nth-child(1) div.invoice-details__item:nth-child(3) span:nth-child(2)').should('be.visible')
    }

    getCreditNoteBtn() {
        return cy.get('[data-cy="credit-note-btn"]').should('be.visible')
    }

    getCreditNoteComment() {
        return cy.get('[name="comment"]').should('be.visible')
    }

    getCreditNoteForInvoice() {
        return cy.get('div.invoice-details__item:nth-child(1) a').should('be.visible')
    }

    getCreditNoteCommentOnDetails() {
        return cy.get('div.invoice-group:nth-child(5) p').should('be.visible')
    }

    submitButton() {
        return cy.get('button[type="submit"]').scrollIntoView()
            .should('be.visible')
    }

    getShowInvoicedFee() {
        return cy.get('.show-invoiced-fees-action')
    }

    getAddFee() {
        return cy.get('span').contains('Add fees')
    }

    getSelectFeeType() {
        return cy.get('.checkbox').eq(0)
    }

    getFeeColumn() {
        return cy.get('tbody tr')
    }
    getAddedFee() {
        return this.getFeeColumn().eq(1).find('td').eq(4)
    }
    getAddPaymentButton() {
        return cy.get('li[data-cy="add-payment-btn"]').should('be.visible')
    }
    getInvoiceTextField() {
        return cy.get('input[name="invoicePayments[0].amount"]').should('be.visible')
    }
    getDatePicker() {
        return cy.get('input.datepicker.flatpickr-input')
    }
    getInvoiceWarning() {
        return cy.get('div.expert-form.invoice-form .info-box-wrapper__rows').should('be.visible')
    }
    getInputError() {
        return cy.get('.expert-form__input-error').should('be.visible')
    }
    getInvoicePayment() {
        return cy.get('tfoot td.right')
    }
    getUpdateDefaultProjectInvoicingEntity () {
        return cy.get('.action').contains('Update Default Project Invoicing Entity').should('be.visible')
    }
    getSelectInvoicingEntityDropdown () {
        return cy.get('[data-cy="invoicing-entity-autocomplete"]')
    }
    getSelectInvoicingEntity () {
        return cy.get('[aria-activedescendant^="downshift-"]')
    }
    getClickInvoicingEntity () {
        return cy.get('[id="downshift-0-item-0"]')
    }
}

export default InvoicePage

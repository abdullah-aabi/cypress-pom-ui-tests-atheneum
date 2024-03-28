class PaymentsPage {

    getClearSearchBtn() {
        return cy.get('.m-l-sm').should('be.visible')
    }

    getPaymentsResults() {
        return cy.get('.invoice-wrapper tbody tr').should('be.visible')
    }

    getPaymentId() {
        return cy.get(':nth-child(1) > .text-wrapper').should('be.visible')
    }

    getPaymentStatus() {
        return cy.get(':nth-child(2) > .text-wrapper').should('be.visible')
    }

    getPaymentAmount() {
        return cy.get(':nth-child(3) > .text-wrapper').should('be.visible')
    }

    getPaymentConvertedAmount() {
        return cy.get(':nth-child(5) > .text-wrapper').should('be.visible')
    }

    getPaymentDate () {
        return cy.get(':nth-child(6) > .text-wrapper').should('be.visible')
    }

    getInvoiceNo() {
        return cy.get('.invoice-wrapper tbody a').should('be.visible')
    }

    getPaymentInvoiceType() {
        return cy.get(':nth-child(8) > .text-wrapper').should('be.visible')
    } 

    getEndDateField () {
        return cy.get('input.datepicker').last().should('be.visible')
    }

    getTodayDateField () {
        return cy.get('.open  .flatpickr-rContainer > .flatpickr-days > .dayContainer > .today')
        .should('be.visible')
    }

    selectEndDate () {
        this.getEndDateField().click()
        this.getTodayDateField().click()
    }

    getClientAccount () {
        return cy.get(':nth-child(10) > .row--link').should('be.visible')
    }
}

export default PaymentsPage
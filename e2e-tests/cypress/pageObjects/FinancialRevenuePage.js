class FinancialRevenuePage {

    getClearSearchBtn() {
        return cy.get('.m-l-sm').should('be.visible')
    }

    getParentAccountField () {
        return cy.get('.autocomplete__input').first().should('be.visible')
    }

    getAccountField() {
        return cy.get('.autocomplete__input').last().should('be.visible')
    }

    getTotalResults() {
        return cy.get('.table-wrapper tbody tr').should('be.visible')
    }

    getStartDateField () {
        return cy.get('input.datepicker').first().should('be.visible')
    }

    getTodayDateField () {
        return cy.get('.open  .flatpickr-rContainer > .flatpickr-days > .dayContainer > .today')
        .should('be.visible')
    }

    getCurrentMonth () {
        return cy.get('.open .flatpickr-next-month').should('be.visible')
    }

    selectStartDate () {
        this.getStartDateField().click()
        this.getCurrentMonth().click()
        this.getTodayDateField().click()
    }

    getAutoComplete () {
        return cy.get('.autocomplete__results-container div').should('exist')
      }

    selectParentAccount (parentAccount) {
        this.getParentAccountField().type(parentAccount)
        this.getAutoComplete().each($el => {
            if ($el.text().includes(parentAccount)) {
              cy.wrap($el).click()
            }
          })
    }

    selectAccount (account) {
        this.getAccountField().type(account)
        this.getAutoComplete().each($el => {
            if ($el.text().includes(account)) {
              cy.wrap($el).click()
            }
          })
    }

    getCheckbox (checkboxText) {
        return cy.get('.option-group__option').contains(checkboxText)
        .find('.checkbox')
    }

    getEntryColumn () {
        return cy.get('.table-wrapper tbody td a').should('be.visible')
    }

    getAccountNameColumn () {
        return cy.get('.table-wrapper :nth-child(2) > .row--link').should('be.visible')
    }

    getProjectNameColumn () {
        return cy.get('.table-wrapper :nth-child(3) > .row--link').should('be.visible')
    }

    getProjectStatus () {
        return cy.get('.status-label').should('be.visible')
    }

    getProjectCode () {
        return cy.get('.table-wrapper td:nth-child(4)').should('be.visible')
    }

    getDelieveryDate () {
        return cy.get('.table-wrapper td:nth-child(7)').should('be.visible')
    }

    getDocumentDate () {
        return cy.get('.table-wrapper td:nth-child(8)').should('be.visible')
    }

    getFeeColumn () {
        return cy.get('.table-wrapper td:nth-child(9)').should('be.visible')
    }

    getUnallocatedColumn () {
        return cy.get('.table-wrapper td:nth-child(12)').should('be.visible')
    }

    getNotInvoicedIcon () {
        return cy.get('.table-wrapper td:nth-child(10) rect').should('be.visible')
    }

    getAllocatedIcon () {
        return cy.get('.table-wrapper td:nth-child(11) polygon').should('be.visible')
    }

    getAllocatedInvoiceIcon () {
        return cy.get('.table-wrapper td:nth-child(10) polygon').should('be.visible')
    }

    getInvoicedAmount () {
        return cy.get('.table-wrapper td:nth-child(10)').should('be.visible')
    }

    getFinancialRevenueField () {
        return cy.get('.table-wrapper td:nth-child(14)').should('be.visible')
    }

    getAction (actionText) {
        return cy.get('div.action').contains(actionText).should('be.visible')
    }

    getDocumentDateField () {
        return cy.get('.expert-form .datepicker').should('be.visible')
    }

    selectDocumentDate () {
        this.getDocumentDateField().click()
        this.getTodayDateField().click()
    }

    getGeneralAdjustmentAmount () {
        return cy.get('[name="amount"]').should('be.visible')
    }

    getSelectCurrencyField () {
        return cy.get('.expert-form .expert-form__input-group:nth-child(2) button')
        .should('be.visible')
    }

    selectCurrency (currency) {
        this.getSelectCurrencyField().click()
        this.getAutoComplete().each($el => {
            if ($el.text().includes(currency)) {
              cy.wrap($el).click()
            }
          })
    }

    getAdjustmentColumn () {
        return cy.get('.table-wrapper td:nth-child(13)').should('be.visible')
    }

    getGeneralFeeAdjEntryColumn (){
        return cy.get('.table-wrapper td:nth-child(1)').should('be.visible')
    }
}

export default FinancialRevenuePage
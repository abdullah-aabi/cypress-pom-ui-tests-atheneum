class DraftedInvoiceSearchPage {

    getInvoiceResults() {
        return cy.get('.revenues-view tbody').find('tr')
    }

    selectStatus (status) {
        this.getStatusField().click()
        this.getAutoComplete().each($el => {
            if ($el.text() === status) {
              cy.wrap($el).click()
            }
          })
    }

    getStatusField () {
        return cy.get(':nth-child(6) > .filter-input > .autocomplete__container > .autocomplete__input')
        .should('be.visible')
    }

    getAutoComplete () {
        return cy.get('.autocomplete__results-container div').should('exist')
      }

      getInvoiceNoField () {
        return cy
          .get('div.filter-input__with-button input')
          .last()
          .should('be.visible')
      }

      selectSentToClientStatus (status) {
        this.getClientStatusField().click()
        this.getAutoComplete().each($el => {
            if ($el.text() === status) {
              cy.wrap($el).click()
            }
          })
    }

    getClientStatusField () {
        return cy.get(':nth-child(7) > .filter-input > .autocomplete__container > .autocomplete__input')
        .should('be.visible')
    }
}

export default DraftedInvoiceSearchPage

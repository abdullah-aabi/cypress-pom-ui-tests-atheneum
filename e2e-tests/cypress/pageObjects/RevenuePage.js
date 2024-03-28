class RevenuePage {
    getAccountProjectEmployeeSearchField () {
      return cy.get('.revenues-panel .filter-input__with-button').should('be.visible')
    }

    getAtheneumOfficeField () {
        return cy.get('.revenues-panel .filter-group__in-view:nth-child(2) button')
        .should('be.visible')
    }

    selectAtheneumOffice (atheneumOffice) {
        this.getAtheneumOfficeField().click()
        this.getAutoComplete().each($el => {
            if ($el.text() === atheneumOffice) {
              cy.wrap($el).click()
            }
          })
    }

    getProjectTypeField () {
        return cy.get('.revenues-panel .filter-group__in-view:nth-child(3) button')
        .should('be.visible')
    }

    selectProjectType (projectType) {
        this.getProjectTypeField().click()
        this.getAutoComplete().each($el => {
            if ($el.text() === projectType) {
              cy.wrap($el).click()
            }
          })
    }

    getAutoComplete () {
        return cy.get('.autocomplete__results-container div').should('exist')
      }

    getClientAccountTypeField () {
        return cy.get('.revenues-panel .filter-group__in-view:nth-child(4) button')
        .should('be.visible')
    }

    selectClientAccount (clientAccount) {
        this.getClientAccountTypeField().click()
        this.getAutoComplete().each($el => {
            if ($el.text() === clientAccount) {
              cy.wrap($el).click()
            }
          })
    }

    getClearSearchBtn () {
        return cy.get('.m-l-sm').should('be.visible')
    }

    getAutocompleteItems () {
        return cy
          .get('div.autocomplete__results-container [class*="autocomplete__item"]')
          .should('be.visible')
      }

      getRevenueResults () {
        return cy.get('.revenues tbody tr').should('be.visible')
      }
}

export default RevenuePage
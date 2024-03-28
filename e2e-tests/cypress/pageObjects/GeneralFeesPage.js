class GeneralFeesPage {

    getClearSearchBtn() {
        return cy.get('.m-l-sm').should('be.visible')
    }

    getClientAccountField() {
        return cy.get('input[role="combobox"]').first().should('be.visible')
    }

    selectClientAccount(clientAccountName) {
        this.getClientAccountField().type(clientAccountName)
        this.getAutoComplete().each($el => {
            if ($el.text().includes(clientAccountName)) {
                cy.wrap($el).click()
            }
        })
    }

    getTypeDropdown() {
        return cy.get('.filter-input  .autocomplete__container').last().should('be.visible')
    }

    getAutoComplete() {
        return cy.get('.autocomplete__results-container div').should('exist')
    }

    selectType(generalFeeType) {
        this.getTypeDropdown().click()
        this.getAutoComplete().each($el => {
            if ($el.text().includes(generalFeeType)) {
                cy.wrap($el).click()
            }
        })
    }

    getWithoutContract() {
        return cy.get('input[type="checkbox"]').should('be.visible')
    }

    getContractField() {
        return cy.get('input[role="combobox"]').last().should('be.visible')
    }

    selectContract(contractName) {
        this.getContractField().type(contractName)
        this.getAutoComplete().each($el => {
            if ($el.text().includes(contractName)) {
                cy.wrap($el).click()
            }
        })
    }

    getProjectField() {
        return cy.get('.filter-group:nth-child(3) input[role="combobox"]').should('be.visible')
    }

    selectProject(projectName) {
        this.getProjectField().type(projectName)
        this.getAutoComplete().each($el => {
            if ($el.text().includes(projectName)) {
                cy.wrap($el).click()
            }
        })
    }

    getTitle() {
        return cy.get('.title > .font-weight-normal').should('be.visible')
    }

    getTotalResults() {
        return cy.get('.table-wrapper--nested tbody > tr:not([class*="title"])').should('be.visible')
    }

    getFeeType() {
        return cy.get('.text-wrapper a').should('be.visible')
    }

    getExpertName() {
        return cy.get('.text-wrapper span').should('be.visible')
    }

    getDelieveryDate() {
        return cy.get('td:nth-child(2) .text-wrapper').should('be.visible')
    }

    getCallDurationDetail() {
        return cy.get('td:nth-child(3) .text-wrapper').should('be.visible')
    }

    getCost() {
        return cy.get('td:nth-child(6) .text-wrapper').should('be.visible')
    }

    getFee() {
        return cy.get('td:nth-child(7) .text-wrapper').should('be.visible')
    }

    getTotalCost() {
        return cy.get('tbody tr:nth-child(1) th:nth-child(3)').should('be.visible')
    }

    getTotalFee() {
        return cy.get('tbody tr:nth-child(1) th:nth-child(4)').should('be.visible')
    }

    getTotalCostOntop() {
        return cy.get(':nth-child(4) > div > h1').should('be.visible')
    }

    getTotalFeeOntop() {
        return cy.get(':nth-child(3) > div > h1').should('be.visible')
    }
}

export default GeneralFeesPage
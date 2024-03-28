class ComplianceBreachPage {
    getDataRows () {
        return cy.get('.cb-content tbody tr').should('be.visible')
    }

    selectFilterOption (filterOption) {
        return cy.get('.cb-filters-selection select').select(filterOption)
    }

    getFilterInput () {
        return cy.get('.cb-filters-selection input').should('be.visible')
    }

    getAddFilterButton () {
        return cy.get('.cb-filters-button').should('be.visible')
    }
}

export default ComplianceBreachPage

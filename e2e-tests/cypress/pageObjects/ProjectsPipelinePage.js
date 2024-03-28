class ProjectsPipelinePage {

    getAtheneumContactField() {
        return cy.get('.autocomplete__container input').should('be.visible')
    }

    getAutoComplete() {
        return cy.get('.autocomplete__results-container div').should('exist')
    }

    selectAtheneumContact(atheneumContact) {
        this.getAtheneumContactField().type(atheneumContact)
        this.getAutoComplete().each($el => {
            if ($el.text() === atheneumContact) {
                cy.wrap($el).click()
            }
        })
    }

    getAtheneumOfficeDropdown() {
        return cy.get('.filter-input  .autocomplete__container').last().should('be.visible')
    }

    selectAtheneumOffice(officeName) {
        this.getAtheneumOfficeDropdown().click()
        this.getAutoComplete().each($el => {
            if ($el.text().includes(officeName)) {
                cy.wrap($el).click()
            }
        })
    }

    getProjectsPipelineResults() {
        return cy.get('.revenues-view tbody tr').should('be.visible')
    }

}

export default ProjectsPipelinePage
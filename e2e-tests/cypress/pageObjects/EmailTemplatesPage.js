class EmailTemplatesPage {
    getCreateTemplateButton () {
        return cy
            .get('.search-panel-container__wrapper button.button--full')
            .should('be.visible')
    }

    getFilterInput () {
        return cy
            .get('[data-cy=template-filter-input]')
            .should('be.visible')
    }

    getTemplateNameInput () {
        return cy.get('[data-cy=template-name-input]').should('be.visible')
    }

    getTemplateGroupInput () {
        return cy.get('[data-cy=template-group-select]').should('be.visible')
    }

    getTemplateSubjectInput () {
        return cy.get('[data-cy=template-subject-input]').should('be.visible')
    }

    getTemplateContentInput () {
        return cy.get('[data-cy=template-body-input] div.fr-view')
    }

    getTemplateSaveButton () {
        return cy.get('[data-cy=template-save-button]').should('be.visible')
    }

    getEmailTemplates () {
        return cy.get('[data-cy=template-name-span]').should('be.visible')
    }

    getEmailTemplateGroup () {
        return cy.get('[data-cy=template-name-span]').next().should('be.visible')
    }
}

export default EmailTemplatesPage

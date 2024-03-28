class ClientShortListPage {

    getProjectTitle() {
        return cy.get('.project-header__title')
    }

    getCheckShortlist(value) {
        return cy.get('.epl__action').contains(value)
    }

    getShortlistStatus() {
        return cy.get('.status-label-new').contains('Shortlisted')
    }

    getToggle() {
        return cy.get('[type="checkbox"]')
    }

    getAllExpertTab() {
        return cy.get('.tab__link').contains('All experts')
    }

    getEmptyMessage() {
        return cy.get('.project-segments__empty-message-title')
    }
}

export default ClientShortListPage
class ClientsAppPage {
    getEPLAction() {
        return cy.get('div.epl__action').should('be.visible')
    }

    getExpertName() {
        return cy.get('.epl__expert-name').should('be.visible')
    }

    getClientTabLink() {
        return cy.get('li.tab__link').should('be.visible')
    }

    getFeeAmount() {
        return cy.get('.epl__location.epl__text-group-item').last().should('be.visible')
    }

    getCancelRequestButton() {
        return cy.get('button.epl__action').contains('Cancel request').should('be.visible')
    }

    getRequestSchedulingButton() {
        return cy.get('button.epl__action').contains('Request scheduling').should('be.visible')
    }

    getCancelRequestConfirmButton() {
        return cy.get('.modal__buttons button.button').contains('Cancel request').should('be.visible')
    }

    getCancellationOkButton() {
        return cy.get('.modal__buttons button.button').contains('OK').should('be.visible')
    }

    getRejectProfileButton() {
        return cy.get('button.epl__action').contains('Not Relevant').should('be.visible')
    }

    getRejectConfirmButton() {
        return cy.get('.modal__buttons button.button').contains('Not Relevant').should('be.visible')
    }

    getShowRejectedExpertsLink() {
        return cy.get('div.project-segment__link').should('be.visible')
    }

    getModalConsultationTitle() {
        return cy.get('div.modal__title').should('be.visible')
    }

    getEPLActionBtn(btn) {
        return cy.get(`button.epl__action:nth-child(${btn})`)
    }

    getTimeSlotAvaialability() {
        cy.get('div.availability-calendar__time-controls button').contains('Start time').should('be.visible').click()
        cy.get('div#downshift-0-item-0').click()

        cy.get('div.availability-calendar__time-controls button').contains('End time').should('be.visible').click()
        cy.get('div#downshift-1-item-1').click()
    }

    getSubmitButton() {
        return cy.get('button.button--primary')
    }

    getPopupTitle() {
        return cy.get('div.modal__title')
    }

    getExpertCode() {
        return cy.get('span.code-label')
    }
}
export default ClientsAppPage
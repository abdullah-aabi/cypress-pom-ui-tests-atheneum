class EPLDetailsPage {

    getExpertName() {
        return cy.get('.row--link').should('be.visible')
    }

    getScreeningFieldText() {
        return cy.get(':nth-child(4) > .field-toggle-group .left-text .fr-box .fr-wrapper .fr-element').should('be.visible')
    }

    getSaveBtn () {
        return cy.get('.button--primary').scrollIntoView().should('be.visible')
    }

    getScreeningMissingErrorMsg () {
        return cy.get('.message__error').should('be.visible')
    }

    getScreeningQueAns (ques, ans) {
        return cy.get(`.edit-epl__screening-qa:nth-child(${ques}) .edit-epl__screening-qa-item:nth-child(${ans}) p`).should('be.visible')
    }

    getScheduleTime () {
        return cy.get('.m-t-lg div p').should('be.visible')
    }

}
export default EPLDetailsPage

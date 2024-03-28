class ClientLoginAsPage {

    getLoginAsTitle() {
        return cy.get('.client-list .title')
    }

    chooseExistingUser() {
        this.getChooseUser().click()
        return cy.get('li[role="option"]')
    }

    getChooseUser() {
        return cy.get('.MuiSelect-root')
    }

    getSubmitBtn() {
        return  cy.get('.client-list button[type="button"]').contains('OK')
    }

    getAuthorizeBtn() {
        return  cy.get('.client-list button[type="button"]').contains('AUTHORIZE')
    }
    newUserBtn () {
        return cy.get('.create-new')
    }

    getFirstName () {
        return cy.get('.client-field:nth-child(1) input')
    }

    getLastName () {
        return cy.get('.client-field:nth-child(2) input')
    }

    getEmail () {
        return cy.get('.client-field:nth-child(3) input')
    }

    getAuthorizeErrorHeading () {
        return cy.get('.error-modal .title')
    }

    getAuthorizeErrorMessage () {
        return cy.get('.error-modal div:nth-child(2)')
    }

    getAtheneumContactName () {
        return cy.get('.error-modal .name')
    }

    getAtheneumContactEmail () {
        return cy.get('.error-modal div > div > div:nth-child(3)')
    }

    getLoginAs () {
        return cy.get('.name-wrap')
    }
}
export default ClientLoginAsPage
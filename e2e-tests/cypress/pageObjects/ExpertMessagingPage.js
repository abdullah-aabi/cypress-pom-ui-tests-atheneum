class ExpertMessagingPage {

    getMessagingButton() {
        return cy.get('a[href*="correspondence"]').should('exist')
    }

    getChatTab() {
        return cy.get('div.chat-tab')
    }

    getChatBox() {
        return cy.get('p.no-messages')
    }

}

export default ExpertMessagingPage

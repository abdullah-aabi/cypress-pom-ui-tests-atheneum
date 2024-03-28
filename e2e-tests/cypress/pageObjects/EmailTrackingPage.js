class EmailTrackingPage {

  getRecipients() {
    return cy.get('tbody > tr').eq(0).find('td').eq(2).should('be.visible')
  }

  getSent(index) {
    return cy.get('tbody > tr').eq(index).find('td').eq(3).should('be.visible')
  }

  getSeeEmails() {
    return cy.get('a').contains('See emails')
  }
}

export default EmailTrackingPage

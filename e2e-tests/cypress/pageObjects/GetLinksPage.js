class GetLinksPage {
    getClientName () {
      return cy.get('.client-name')
        .should('be.visible')
    }
  
    getClientLink () {
      return cy.get('.path')
        .should('be.visible')
    }
  
  }
  
  export default GetLinksPage
  
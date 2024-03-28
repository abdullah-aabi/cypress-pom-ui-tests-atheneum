class EYComplianceReviewPage {
    getExpertComplianceButton (btn) {
      return cy.get(`.expert-form__section:nth-child(${btn}) button`).should('be.visible')
    }

    getSelectionOption (selectoption) {
        return cy.get(`.expert-form__section .autocomplete__results-container div:nth-child(${selectoption})`)
        .should('be.visible')
    }

    getSaveBtn () {
        return cy.get('button[type="submit"]').should('be.visible')
    }
 
  }
  
  export default EYComplianceReviewPage
  
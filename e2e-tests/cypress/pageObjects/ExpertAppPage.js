class ExpertsAppPage {
  getComplianceMissing() {
    return cy.get('.compliance-wrapper .danger-label').should('be.visible')
  }

  getComplianceRequestDropdown() {
    return cy.get('.compliance__dropdown').should('be.visible')
  }

  selectSendComplianceRequest(complianceValue) {
    this.getComplianceRequestDropdown().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(complianceValue)) {
        cy.wrap($el).click()
      }
    })
  }

  getAutocompleteItems() {
    return cy.get(
      'div.autocomplete__results-container [class*="autocomplete__item"]'
    )
  }
}
export default ExpertsAppPage

class TeamsPage {
  getNewTeamButton () {
    return cy.get('button.team-btn').contains('New team').should('be.visible')
  }

  getCloseButton () {
    return cy.get('#smallcross')
  }

  getTeamNameField () {
    return cy.get('[name="team.name"]').should('be.visible')
  }

  getAtheneumOfficeField () {
    return cy.get('.expert-form__input-group button')
  }

  selectAtheneumOffice (officeName) {
    this.getAtheneumOfficeField().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(officeName)) {
        cy.wrap($el).click()
      }
    })
  }

  getAccountManagerField () {
    return cy.get('[placeholder="Account Manager"]')
  }

  getRegionalPrincipalField () {
    return cy.get('[placeholder="Regional Principal"]')
  }

  selectRegionalPrincipal (regionalPrincipalName) {
    this.getRegionalPrincipalField().type(regionalPrincipalName)
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(regionalPrincipalName)) {
        cy.wrap($el).click()
      }
    })
  }

  getSubmitButton () {
    return cy.get('[type="submit"]').should('be.visible')
  }

  getAutocompleteItems () {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
  }

  getTeamCardAction (teamName) {
    return cy
      .get(`div.team--team-card[id="${teamName}"] div.action`).should('be.visible')
  }

  selectAccountManager (accountManagerName) {
    this.getAccountManagerField().type(accountManagerName)
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(accountManagerName)) {
        cy.wrap($el).click()
      }
    })
  }

  getTeamName () {
    return cy.get('.team--team-card h2').should('be.visible')
  }

  getEmployeeFieldByID (teamName, employeeId) {
    return cy.get(`.team--team-card[id="${teamName}"] [id="employee-${employeeId}"] a[href="/employee/${employeeId}"]`).should('be.visible')
  }

  getPrincipalNameByID (teamName, employeeId) {
    return cy.get(`.team--team-card[id="${teamName}"] .team__principal-wrapper a[href="/employee/${employeeId}"]`).should('be.visible')
  }

  getEmployeePositionByID (teamName, employeeId) {
    return cy.get(`.team--team-card[id="${teamName}"] [id="employee-${employeeId}"] .team--position`).should('be.visible')
  }

  getAddAssociate () {
    return cy.get('[placeholder="Employee"]').should('exist')
  }

  selectEmployeeByName (associateName) {
    this.getAddAssociate().type(associateName)
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(associateName)) {
        cy.wrap($el).click()
      }
    })
  }

  getAssociateField () {
    return cy.get('.autocomplete__container input')
  }

  getAddTeamLeadTitle () {
    return cy.get('.expert-form h1')
  }

  getPrincipalPosition (teamName) {
    return cy.get(`.team--team-card[id="${teamName}"] .team__principal-wrapper span`).should('be.visible')
  }

  getTargetValueForEmployee (teamName, employeeId) {
    return cy
      .get(
        `[id="${teamName}"] #employee-${employeeId} div:nth-child(3) input`
      )
      .scrollIntoView()
  }

  getEditTitle () {
    return cy.get('.expert-form h1')
  }

  getDeleteTitle () {
    return cy.get('#swal2-title')
  }

  getDeleteConfirmationButton () {
    return cy.get('button[class*=confirm]').should('be.visible')
  }
}

export default TeamsPage

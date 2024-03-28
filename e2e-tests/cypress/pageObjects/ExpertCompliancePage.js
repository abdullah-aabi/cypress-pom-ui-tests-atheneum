class ExpertCompliancePage {
  getComplianceLanguage () {
    return cy.get('.autocomplete__input')
  }

  getExpertNameOnCompliancePage () {
    return cy.get('p.header__profile-text')
  }

  getComplianceAgreeButton () {
    return cy.get('.button--primary')
  }

  getComplianceDisagreeButton () {
    return cy.get('.button--secondary')
  }

  getScheduledConsulations () {
    return cy.get('.expert-wrapper > :nth-child(1)')
  }

  getComplianceStatusChangeComment () {
    return cy.get('.expert-form__input')
  }

  getComplianceStatusSaveButton () {
    return cy.get('.iconWrapper > .button')
  }
}

export default ExpertCompliancePage

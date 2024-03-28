class FeePage {
  getEditButton () {
    return cy.get('[data-cy="edit-fee-btn"]').should('be.visible')
  }

  getDeleteButton () {
    return cy
      .get('div.action span')
      .should('be.visible')
      .contains('Delete')
  }

  getFeeFormNotificationMessages () {
    return cy.get('div.expert-form div.info-box-wrapper__rows').should('be.visible')
  }

  getProjectOutcomeButton () {
    return cy.get('.actions [href*=outcome]').should('be.visible')
  }

  getConfirmDeleteButton () {
    return cy.get('.swal2-confirm').should('be.visible')
  }

  getOutcometab () {
    return cy.get('a[href*=outcome]').should('be.visible')
  }

  getEditButtonOnOutcome () {
    return cy.get('.no-wrap .clickable:nth-child(1)').should('be.visible')
  }

  getFeeField () {
    return cy.get('[name = "feeValue"]').should('be.visible')
  }

  getCostField () {
    return cy.get('[name = "costValue"]').scrollIntoView()
  }

  getHeadingOnFeePage(n){
    return cy.get(`.invoice-wrapper div:nth-child(${n})> h2`).should('be.visible')
  }
}

export default FeePage

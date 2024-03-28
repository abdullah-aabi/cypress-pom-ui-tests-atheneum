class ExpertSearchPage {
  getSelectAllExpertsCheckbox() {
    return cy.get('div.expert-search-header input[type=checkbox]').should('be.visible')
  }

  getEnabledExpertCheckBox() {
    return cy.get('div.expert-search-item-container input:not([disabled])').should('exist')
  }

  getExpertItemLink() {
    return cy.get('div.expert-search-item-container a').should('exist')
  }

  getExpertItemLinkById(expertId) {
    return cy.get(`div.expert-search-item-container a[href="/expert/${expertId}"]`).should('exist')
  }

  getAddInviteSelectedExperts() {
    return cy.get('.expert-search-header span').contains('Add/Invite')
  }

  checkExpertResultsAndTotalField(expertSearchResult) {
    if (expertSearchResult.body.hits.hits.length > 0) {
      this.getExpertResultField().should(
        'have.length',
        expertSearchResult.body.hits.hits.length
      )
    }

    this.getExpertResultTotalField().should(
      'have.text',
      `Total number of matches: ${expertSearchResult.body.hits.total.value}`
    )
  }

  getExpertNameField() {
    return cy
      .get('div.filter-input__with-button input')
      .last()
      .should('be.visible')
  }

  searchIconExpertName() {
    return cy
      .get('.filter-group .button--primary')
      .last()
      .should('be.visible')
  }

  getKeywordField() {
    return cy
      .get('div.filter-input__with-button input')
      .first()
      .should('be.visible')
  }

  getExpertResultField() {
    return cy
      .get('div.expert-search-item span[class=name]')
      .should('be.visible')
  }

  getExpertSearchList() {
    return cy.get('a div.expert-search-item')
  }

  getHighlightedText() {
    return cy.get('span[style="background-color:#FFD700 !important; z-index:10;"]')
  }
  getExpertsSelectedTotal() {
    return cy.get('h4.expert-search-total-inline').should('exist')
  }

  getExpertResultTotalField() {
    cy.get('.expert-search-total-inline .icon--tooltip')
      .should('be.visible')
      .click()

    return cy.get('.rc-tooltip-inner:first')
  }

  getClearSearchButton() {
    return cy.get('.search-panel-container__title--action').should('exist')
  }

  getCreateNewExpertButton() {
    return cy.get('[data-cy="create-expert-btn"]')
  }

  getExpertFiltersCheckbox() {
    return cy.get('.checkbox')
  }

  getExpertFiltersRadiobutton() {
    return cy.get('.radio-button-input')
  }

  getAutocompleteItems() {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible')
  }

  getButtonAutocomplete() {
    return cy.get('button.autocomplete__input')
  }

  selectFilterWithButton(filterName, option) {
    this.getButtonAutocomplete()
      .contains(filterName)
      .click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(option)) {
        cy.wrap($el).click()
      }
    })
    this.getButtonAutocomplete().contains(option)
  }

  getPinIcon() {
    return cy.get('#pin').should('exist')
  }

  getAthenaListHeading() {
    return cy.get('#free-solo-with-text-demo-label').should('be.visible')
  }

  getAthenaListOnExpertSearch() {
    return cy.get('#free-solo-with-text-demo').should('be.visible')
  }

  getAutoComplete() {
    return cy.get('[id$=-option-0]').should('exist')
  }

  selectNewList(listName) {
    this.getAthenaListOnExpertSearch().type(listName)
    this.getAutoComplete().each($el => {
      if ($el.text().includes(listName)) {
        cy.wrap($el).click()
      }
    })
  }

  getExpandIcon() {
    return cy.get('.search-group__container').should('be.visible')
  }

  getUnpinIcon() {
    return cy.get('.expert-search-panel-results-container .icon__fill').should('be.visible')
  }

  getGoToListIcon() {
    return cy.get('.expert-search-header .MuiButton-label').should('be.visible')
  }

  getUniqueExpert() {
    return cy.get('.expert-search-item').should('be.visible')
  }
}

export default ExpertSearchPage

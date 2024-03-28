class AccountSearchPage {
  getSearchInput () {
    return cy
      .get('.filter-input__with-button input')
      .scrollIntoView()
      .should('be.visible')
  }

  getSearchButton () {
    return cy
      .get('.filter-input__with-button .button--primary')
      .should('be.visible')
  }

  getFilterOption () {
    return cy.get('.option-group__option').should('be.visible')
  }

  getSearchResult () {
    return cy.get('.client-search-list-item p').should('be.visible')
  }

  getSearchResultParentAccount () {
    return cy
      .get('.client-search-list-item--parentaccount')
      .should('be.visible')
  }

  getSearchResultParentAccountAll () {
    return cy
      .get('.client-search-list-item-all--parentaccount')
      .should('be.visible')
  }

  getSearchResultAccount () {
    return cy.get('.client-search-list-item--account').should('be.visible')
  }

  getSearchResultAccountAll () {
    return cy
      .get('.client-search-list-item-all--account p')
      .should('be.visible')
  }

  getSearchResultOfficeAll () {
    return cy.get('.client-search-list-item-all--office p').should('be.visible')
  }

  expandParentAccount (parentAccountName) {
    this.getSearchResultParentAccountAll()
      .contains(parentAccountName)
    return this.getSearchResultParentAccountAll()
      .contains(parentAccountName)
      .parent()
      .find('.icon')
      .click()
  }

  expandAccount (accountName) {
    this.getSearchResultAccountAll()
      .contains(accountName)
    return this.getSearchResultAccountAll()
      .contains(accountName)
      .parent()
      .parent()
      .find('.icon')
      .click()
  }
}

export default AccountSearchPage

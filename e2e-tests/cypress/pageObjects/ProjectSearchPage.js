class ProjectSearchPage {
  checkProjectResultsAndTotalField (projectSearchResult) {
    if (projectSearchResult.body.hits.total.value > 0) {
      this.getProjectResultField().should(
        'have.length',
        projectSearchResult.body.hits.hits.length
      )
    }

    this.getProjectResultsTotalField().should(
      'contain.text',
      `${projectSearchResult.body.hits.total.value} projects`
    )
  }

  getProjectSearchField () {
    return cy.get('.filter-input__with-button input')
  }

  getSearchResultProjectLink () {
    return cy.get('.project-search-results__search-items-wrapper a')
  }

  getProjectSearchButton () {
    return cy.get('.filter-input__with-button .button--primary')
  }

  getProjectResultField () {
    return cy
      .get('div.project-search-results__search-item-container span[class=name]')
      .should('be.visible')
  }

  getProjectResultsTotalField () {
    return cy.get('h4.expert-search-total').should('be.visible')
  }

  getClientSearchField () {
    return cy.get('input[placeholder*="client account"]').should('be.visible')
  }

  getAtheneumContactSearchField () {
    return cy.get('input[placeholder*="Atheneum contact"]').should('be.visible')
  }

  getSelectFilterByParentName (parentName) {
    return cy
      .get('.filter-group')
      .contains(parentName)
      .parent()
      .find('.autocomplete__input')
  }

  selectOpenProjectPage (projectPage) {
    this.getSelectFilterByParentName('Open projects in').click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(projectPage)) {
        cy.wrap($el).click()
      }
    })
    this.getSelectFilterByParentName('Open projects in').should(
      'contain.text',
      projectPage
    )
  }

  getOpenStatusButton () {
    return cy.get('button.Open').should('be.visible')
  }

  getPendingStatusButton () {
    return cy.get('button.Pending').should('be.visible')
  }

  getClosedStatusButton () {
    return cy.get('button.Closed').should('be.visible')
  }

  clickProjectSearchResultItem (projectName) {
    cy.get('.search-item')
      .should('be.visible')
      .each(($el, index, $list) => {
        const textProject = $el.text()
        if (textProject.includes(projectName) && textProject.includes('Open')) {
          $el.click()
        }
      })
  }

  selectProjectTypeFilter (projectType) {
    this.getSelectFilterByParentName('Project Type').click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(projectType)) {
        cy.wrap($el).click()
      }
    })
    this.getSelectFilterByParentName('Project Type').should(
      'contain.text',
      projectType
    )
  }

  selectEPLStatusFilter (eplStatus) {
    this.getSelectFilterByParentName('EPL status').click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(eplStatus)) {
        cy.wrap($el).click()
      }
    })
    this.getSelectFilterByParentName('EPL status').should(
      'contain.text',
      eplStatus
    )
  }

  selectEPLReplyStatusFilter (eplReplyStatus) {
    this.getSelectFilterByParentName('EPL reply status').click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(eplReplyStatus)) {
        cy.wrap($el).click()
      }
    })
    this.getSelectFilterByParentName('EPL reply status').should(
      'contain.text',
      eplReplyStatus
    )
  }

  getClearSearchButton () {
    return cy.get('.search-panel-container__title--action').should('exist')
  }

  getFilteredContents () {
    return cy.get('.project-search-results__search-items-wrapper')
  }

  getDeleteProjectButton () {
    return cy.get('.action > .icon > svg > .icon__fill')
  }

  getProjectCloseButton () {
    return cy.get('.group-wrapper .Closed')
  }

  getProjectClosingCommentField () {
    return cy.get('textarea.expert-form__input')
  }

  getSaveAndCloseProject () {
    return cy.get('button[type=submit]')
  }

  getDeleteConfirmButton () {
    return cy.get('.center-text > .button--primary')
  }

  getCreateProjectButton () {
    return cy.get('button.button--full').should('be.visible')
  }

  getAutocompleteItems () {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible')
  }
}

export default ProjectSearchPage

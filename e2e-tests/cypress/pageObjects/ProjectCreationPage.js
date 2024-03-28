class ProjectCreationPage {
  getAutocompleteSubItems() {
    return cy
      .get(
        'div.autocomplete__results-container [class*="autocomplete__item--suboption"]'
      )
      .should('be.visible')
  }

  getAutocompleteItems() {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible')
  }

  getClientContactField() {
    return cy
      .get('[data-cy=client-contact-multiple] .autocomplete__tag')
      .should('exist')
  }

  getClientContactInput() {
    return cy.get('[data-cy=client-contact-multiple] input').should('exist')
  }

  getClientOfficeInput() {
    return cy.get('[data-cy="client-office-autocomplete"]').should('exist')
  }

  getClientAvailabiliesField() {
    return cy.get('[name="clientAvailabilities"]').should('exist')
  }

  getClientAccountField() {
    return cy.get('[name="office.account.companyName"]').should('exist')
  }

  getProjectNameField() {
    return cy.get('input[name=projectName]').scrollIntoView().should('be.visible')
  }

  getAtheneumContactInput() {
    return cy.get('[data-cy=atheneum-contact-multiple] input').scrollIntoView().should('exist')
  }

  getAtheneumContactField() {
    return cy
      .get('[data-cy=atheneum-contact-multiple] .autocomplete__tag').scrollIntoView()
      .should('exist')
  }

  getInputByParentName(parentName) {
    return cy
      .get('.expert-form__label')
      .contains(parentName)
      .parent()
      .find('div.autocomplete__arrow-icon')
  }

  selectClientPrefferedLanguage(clientLanguage) {
    this.getInputByParentName('Preferred client languages').click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(clientLanguage)) {
        cy.wrap($el).click()
      }
    })
  }

  selectClientOfficeField(officeName) {
    this.getClientOfficeInput().type(officeName)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(officeName)) {
        cy.wrap($el).click()
      }
    })
    this.getClientOfficeInput().should('have.attr', 'value', officeName)
  }

  selectProjectType(projectType) {
    return cy
      .get('.radio-group__item__label')
      .contains(projectType)
      .click()
  }

  selectClientContactName(clientName) {
    this.getClientContactInput().type(clientName)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(clientName)) {
        cy.wrap($el).click()
      }
    })
    this.getClientContactField().should('contain', clientName)
  }

  selectAtheneumContactField(atheneumContactName) {
    this.getAtheneumContactInput().type(atheneumContactName)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(atheneumContactName)) {
        cy.wrap($el).click()
      }
    })

    this.getAtheneumContactField().should('contain', atheneumContactName)
  }

  selectProjectManagerId(managerName) {
    cy.get('button[data-cy="project-form-projectManagerId"]').should('be.visible').click()
    cy.get('div.autocomplete__results-container [class*="autocomplete__item"]').contains(managerName)
      .should('be.visible').click()
  }

  getIndustryInput() {
    return cy.get('[data-cy=industry-subindustry-autocomplete]').scrollIntoView().should('be.visible')
  }

  selectIndustryField(industryFieldName) {
    this.getIndustryInput().type(industryFieldName)
    this.getAutocompleteSubItems().each($el => {
      if ($el.text().includes(industryFieldName)) {
        cy.wrap($el).click()
      }
    })

    this.getIndustryInput().should('have.attr', 'value', industryFieldName)
  }

  getBackgroundField() {
    return cy.get('div[data-cy=background-richtext] .fr-element').should('exist')
  }

  getBlacklistedCompaniesField() {
    return cy
      .get(
        'div[data-cy="project-form-blacklistedCompanies"]'
      )
      .should('exist')
  }

  getInvoicingInstructionsField() {
    return cy
      .get(
        'div[data-cy="project-form-invoicingInstructions"]'
      )
      .should('exist')
  }

  getTargetNoOfInterviewsField() {
    return cy.get('input[name=interviewTarget]').should('exist')
  }

  getSegmentTitleField() {
    return cy.get("input[name*='name']").should('exist')
  }

  getNoOfExpertsRequiredField() {
    return cy.get('input[name*="numberOfExpert"]').should('exist')
  }

  getExpertBriefField() {
    return cy.get('textarea[name*="expertBrief"]').should('exist')
  }

  getProjectSaveButton() {
    return cy.get('button[type="submit"]').should('exist')
  }

  getProjectCategoryPopup() {
    return cy.get('.expert-form__title').should('be.visible')
  }

  getProjectCategory() {
    return cy.get('.expert-form__section .autocomplete__container button').should('be.visible')
  }

  getProjectCategoryInput() {
    return cy.get('[data-cy=project-form-projectCategoryId]').should('exist')
  }

  selectProjectCategory(projectCategory) {
    this.getProjectCategoryInput().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(projectCategory)) {
        cy.wrap($el).click()
      }
    })

    this.getProjectCategoryInput().should('contain', projectCategory)
  }
}

export default ProjectCreationPage

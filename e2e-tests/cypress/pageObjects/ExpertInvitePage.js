class ExpertInvitePage {
  getExpertSearchFieldList() {
    return cy.get('.filter-input__with-button').should('be.visible')
  }

  checkExpertWarningMessage(message) {
    return cy.get('div.expert-position-fields').each(expertPosition => {
      cy.get(expertPosition).find('div.red-text').should('be.visible').should('have.text', message)
    })
  }

  getExpertSherlockWarning() {
    return cy.get('.sherlock-warning').should('be.visible')
  }

  getExpertSherlockWriteCommentButton() {
    return cy.get('.sherlock-warning-actions button').contains('Write').scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getExpertSherlockChooseAllButton() {
    return cy.get('.expert-form__section--actions a').contains('Choose').scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getExpertSherlockCommentTextarea() {
    return cy.get('.expert-form__section textarea').scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getExpertSherlockCommentOkButton() {
    return cy.get('.expert-form__section button').contains('Ok').scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getExpertSearchButtonList() {
    return cy
      .get('.filter-input__with-button .button--primary')
      .should('be.visible')
  }

  getDialogHeader() {
    return cy.get('h1.expert-form__title')
  }
  getExpertInviteButton() {
    return cy.get('[data-cy=add-to-project-btn]').should('be.visible')
  }

  getExpertAddOnlyButton() {
    return cy.get('button.button--blue-white')
  }

  getEmailField() {
    return cy.get('input[name="email"]').should('exist')
  }

  selectLanguage(language) {
    return cy.get('div.missing-field')
      .contains('Language')
      .parent()
      .find('label.select__wrapper > select')
      .select(language)
  }

  selectMultipleFieldsByName(fieldName, fieldValue) {
    return cy.get('div[class="missing-field"]')
      .each((selectField, index) => {
        if (selectField.text().indexOf(fieldName) !== -1) {
          cy.get(selectField)
            .contains(fieldName)
            .parent()
            .find('label.select__wrapper > select')
            .select(fieldValue)
        }
      })
  }

  selectTitle(title) {
    return cy.get('div[class="missing-field"]')
      .contains('Title')
      .parent()
      .find('label.select__wrapper select')
      .select(title)
  }

  getProjectSearchField() {
    return cy.get('[data-cy=project-autocomplete]').last().scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getPositionDropdownField() {
    return cy.get('.expert-position-fields button').scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getAutocompleteItems() {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible')
  }

  selectProjectField(projectName) {
    cy.intercept(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/typeahead?q=${projectName.replace(/\s/g, '%20')}&open=true&pending=true`)
      .as('projectSearchRequest')

    this.getProjectSearchField().clear().type(projectName)

    cy.wait('@projectSearchRequest').its('response.statusCode').should('equal', 200)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(projectName)) {
        cy.wrap($el).click()
      }
    })
  }

  getDeleteExpertButton() {
    return cy.get('div.expert-form__repeatable-action--delete').should('exist')
  }

  getExpertSegmentDropDown() {
    return cy.get('[data-cy=segment-dropdown]').last().scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  selectExpertSegmentField() {
    this.getExpertSegmentDropDown().click()
    this.getAutocompleteItems().then(($el) => {
      cy.wrap($el).first().click()
    })
  }

  selectRelevantPosition(relevantPosition) {
    this.getPositionDropdownField().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(relevantPosition)) {
        cy.wrap($el).click()
      }
    })
  }

  getAddAndInviteButton() {
    return cy.get('.expert-form__section .button--primary').should('be.visible')
  }

  getSegmentTitleField() {
    return cy.get('input[name="name"]').should('be.visible')
  }

  getNumberOfExpertField() {
    return cy.get('[name="numberOfExpert"]').should('be.visible')
  }

  getAssignedAssociatesField() {
    return cy.get('.expert-form input[id*="downshift"]').should('be.visible')
  }

  selectAssignedAssociatesField(associateName) {
    this.getAssignedAssociatesField().type(associateName)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(associateName)) {
        cy.wrap($el).click()
      }
    })
    cy.get('.autocomplete__tag').contains(associateName)
  }

  getSendEmailSenderField() {
    return cy
      .get(
        '.modal__content .expert-form__input-wrapper .autocomplete__container .autocomplete__input--dropdown'
      )
      .should('be.visible')
  }

  getSendEmailToField() {
    return cy
      .get(
        'div.expert-form div.autocomplete__tag'
      )
      .should('be.visible')
  }

  getSaveButton() {
    return cy.get('[type="submit"]').scrollIntoView({ easing: 'linear' }).should('be.visible')
  }

  getExpertInvitedMessage() {
    return cy.get('.swal2-modal h2[class*="-title"]')
  }

  getInvitedExpertName() {
    return cy.get('#swal2-content > p').should('be.visible')
  }

  getAddInviteDropdown() {
    return cy.get('.add-only-dropdown')
  }

  goToProjectButton() {
    return cy.get('button.swal2-confirm').should('be.visible')
  }

  getExpertsPipelineButton() {
    return cy.get('a[href*="experts-pipeline"]').should('exist')
  }

  getExpertInExpertPipeline() {
    return cy.get('single__content__thumb')
  }

  getSchedulingToolButton() {
    return cy.get('[data-cy=open-scheduling-tool-btn]')
  }

  getDateOnEpl() {
    return cy.get('.schedule-wrapper__date')
  }

  getTimeOnEpl() {
    return cy.get('.schedule-wrapper__time')
  }
  getExpertCode() {
    return cy.get('span.code-label')
  }
  getEPLStatusDropdown() {
    return cy.get('[data-cy="epl-status-dropdown"] button')
  }
  getDeliveredByText() {
    return cy.get('span.shift-down')
  }
  getExpertName() {
    return cy.get('.expert-form__section:nth-child(2) label div').should('be.visible')
  }

  getDetailsButton(projectId) {
    return cy.get(`[href="/project/${projectId}"] > li`).scrollIntoView().should('be.visible')
  }

  getRecipients() {
    return cy.get('tbody > tr').eq(0).find('td').eq(2).should('be.visible')
  }

  getSent(index) {
    return cy.get('tbody > tr').eq(index).find('td').eq(3).should('be.visible')
  }

  getSeeEmails() {
    return cy.get('a').contains('See emails')
  }

  getExpert() {
    return cy.get('span > a')
  }

  getEmail(Value) {
    return cy.get('.details-list').contains(Value).siblings()
  }

  getReviewConsltation() {
    return cy.get('[title="Review the consultation with Atheneum"]')
  }

  getTemplateDropdown() {
    return cy.get('.expert-form__label').contains('Template').parent().find('.expert-form__input-wrapper')
  }

  getToValue() {
    return cy.get('.autocomplete__tag')
  }
  getCalendarAvailability() {
    return cy.get('div.expert-availabilitites__calendar').should('be.visible')
  }
  getCalendarAvailabilityText() {
    return cy.get('div.expert-availabilitites__calendar div').last().should('be.visible')
  }
  getEplAvailability() {
    return cy.get('div.epl-availabilities__container').should('be.visible')
  }
  getEplAvailabilityDate() {
    return cy.get('div.availability-date').should('be.visible')
  }

  getExpertInvitePreventMessage() {
    return cy.get('.expert-prevent-invite').should('be.visible')
  }

  getEplScheduledDateTime() {
    return cy.get('div.epl__action span b')
  }

  getEplStatus() {
    return cy.get('div[data-cy="epl-status-dropdown"] button').should('be.visible')
  }

  selectEplStatus() {
    return cy.get('div.autocomplete__item')
  }

  getSherlockWarning() {
    return cy.get('.expert-form__subtitle').should('be.visible')
  }

  getExpertProId() {
    return cy.get('input[name="professionalIdentifierNumber"]').should('be.visible')
  }
  getHCPForm() {
    return cy.get('div.expert-form').should('be.visible')
  }

  selectEplReason() {
    cy.get('button.autocomplete__input--dropdown').contains('Select reason').click()
    cy.get('#downshift-3-item-0').should('be.visible').click()
  }

  selectEplBeneficiary() {
    cy.get('button.autocomplete__input--dropdown').contains('Select beneficiary').click()
    cy.get('#downshift-4-item-0').should('be.visible').click()
  }

  selectEplProIdentifier() {
    cy.get('button.autocomplete__input--dropdown').contains('Select professional identifier').click()
    cy.get('#downshift-5-item-0').should('be.visible').click()
  }

  selectEplProfession() {
    cy.get('button.autocomplete__input--dropdown').contains('Select profession').click()
    cy.get('#downshift-6-item-0').should('be.visible').click()
  }

  getExpertInfo() {
    return cy.get('div.info__text').should('be.visible')
  }

  getHonorariumInput() {
    return cy.get('input[name="honorarium"]').should('be.visible')
  }
}

export default ExpertInvitePage

class ExpertDetailsPage {
  getExpertName() {
    return cy.get('h1.m-r-sm').should('be.visible')
  }

  getIndustryExperience() {
    return cy.get('.text div').should('be.visible')
  }

  getExpertDetailsValueByRowName(rowName) {
    return cy.get('.row__name').contains(rowName).parent().find('.row__value')
  }

  getExperiencePositionByName(position) {
    return cy.get('div.experience-wrapper__single div.content').contains(position).parent().find('div.experience-wrapper__label').first()
  }

  getExperienceCompanyByName(position) {
    return cy.get('div.experience-wrapper__single div.content').contains(position).parent().find('div.experience-wrapper__label span')
  }

  getExperienceDescriptionByName(position) {
    return cy.get('div.experience-wrapper__single div.content').contains(position).parent().find('p')
  }

  getCity() {
    return cy
      .get(':nth-child(1) > :nth-child(1) > .row__value')
      .should('be.visible')
  }

  getIndustry() {
    return cy.get(':nth-child(4) > .row > .row__value').should('be.visible')
  }

  getEmail() {
    return cy.get("a[href*='mailto']").should('be.visible')
  }

  getLanguage() {
    return cy.get(':nth-child(5) > .row > .row__value').should('be.visible')
  }

  getHourlyRate() {
    return cy.get('div:last-child > .row > .row__value').should('be.visible')
  }

  getRowName(rowName) {
    return cy.get('span.row__name').contains(rowName).parent().find('span.row__value').should('be.visible')
  }

  getPosition() {
    return cy
      .get('.experience-wrapper__single > .content > :nth-child(1)')
      .should('be.visible')
  }

  getHistory() {
    return cy.get('a.tab').contains('history').should('be.visible')
  }

  getEplLink() {
    return cy.get('tr.clickable-row a').should('have.attr', 'href')
  }
  getAddOnlyButtonList() {
    return cy.get('div.hover-button-block button.add-only-option-button')
  }
  getCallButton() {
    return cy.get('div.call_box').should('be.visible')
  }
  getEplWarning() {
    return cy.get('a.expert-prevent-invite--warning').should('be.visible')
  }
  getContactNumber() {
    return cy.get('p.call_text')
  }

  getCompany() {
    return cy.get('.content > :nth-child(2) > span').should('be.visible')
  }

  getSherlock() {
    return cy.get('.sherlock-reason .m-l-md')
  }

  getSherlockReasonTooltip() {
    return cy.get('div.sherlockTooltipWrapper div.rc-tooltip-inner')
  }

  getLoginAsLinkButton() {
    return cy.get('li > :nth-child(1) > .action > span')
  }

  getLoginAsLink() {
    return cy.get('.modal__content .word-break-all')
  }

  getEditButton() {
    return cy.get('[data-cy=edit-expert-btn]')
  }

  getAddPhoneNumberField(phone) {
    cy.get('h2.expert-form__subtitle').contains('Contact information').parent('div').within(() => {

      cy.get('button.expert-form__repeatable-action--add').should('be.visible').click()
      cy.get('div.expert-bulk-create__dropdown__placeholder').contains('Select type').should('be.visible').click()
      cy.get('div.expert-bulk-create__dropdown__option').contains('whatsapp').click()
      cy.get('input[name="experts.0.address.phones.1.phoneNum"]').should('be.visible').type(phone)
    })
  }
  getScrollDownButton() {
    return cy.get('svg.expert-bulk-create__navigation-button--down').should('be.visible')
  }
  getDeleteButton() {
    return cy.get(':nth-child(4) > li.action > .action')
  }

  getDeleteButtonOnConfirmationPopUp() {
    return cy.get('.swal2-buttonswrapper :nth-child(1)')
  }

  getDeleteConfirmationMessage() {
    return cy.get('.notification-wrapper__single__title')
  }

  getDoNotContactButton() {
    return cy.get('.m-l-lg > span')
  }

  getAddInviteToProjectButton() {
    return cy.get('[data-cy=add-to-project-btn]')
  }

  getSimilarExpertButton() {
    return cy.get(
      '.actions-wrapper > :nth-child(1) > :nth-child(2) > .action > :nth-child(1) > span'
    )
  }

  getPaymentDetailsButton() {
    return cy.get('.inline > .tab > li')
  }

  getContactInfoButton() {
    return cy.get(
      '.actions-wrapper > :nth-child(2) > :nth-child(1) > .action > span'
    )
  }

  getStatusLabel() {
    return cy.get('.status-label').should('be.visible')
  }

  getComplianceMissing() {
    return cy.get('.compliance-wrapper .danger-label').should('be.visible')
  }

  getComplianceInPlace() {
    return cy.get('div.info>div>span.code-label').should('be.visible')
  }

  getUpdateComplianceStatusLink() {
    return cy.get('.update-compliance-status span').should('be.visible')
  }

  getFormStatusChangeTextare() {
    return cy.get('textarea.expert-form__input').should('be.visible')
  }

  getFormStatusChangeSubmit() {
    return cy.get('[type="submit"]').should('be.visible')
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
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('exist')
  }

  getUpdateComplianceStatusButton() {
    return cy.get('.compliance-box > .action')
  }

  getExpertIdForSelectedOrGeneratedExpert() {
    return cy.get('.code-label').should('be.visible')
  }

  getComplianceTextAfterComplianceInPlace() {
    return cy.get('.info > div > span.code-label')
  }

  getComplianceSuccessMessage() {
    return cy.get('.notification-wrapper__single__message')
  }

  getCloseIconOfNotification() {
    return cy.get('.notification-wrapper__single__cancel > .icon > svg')
  }

  getDoNotContactStatusChangeText() {
    return cy.get('.expert-form .expert-form__input')
  }

  getSearchedExpertDetail() {
    return cy.get('.expert-search-item')
  }

  getAddtoAthenaListBtn() {
    return cy.get('.m-r-sm').contains('Add to Athena List')
  }
}
export default ExpertDetailsPage

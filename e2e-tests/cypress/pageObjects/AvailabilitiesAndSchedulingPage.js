class AvailabilitiesAndScheduling {
  getTimeFieldsList () {
    return cy.get('.schedule-calendar-modal .autocomplete__container')
  }

  getAutocompleteItems () {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible')
  }

  selectStartTime () {
    this.getTimeFieldsList()
      .first()
      .click()
    this.getAutocompleteItems()
      .first()
      .click()
  }

  selectEndTime () {
    this.getTimeFieldsList()
      .last()
      .click()
    this.getAutocompleteItems()
      .last()
      .click()
  }

  getClientAvailabilityValues () {
    return cy.get('.availability-calendar__type').should('be.visible')
  }

  getAssociateUnits () {
    return cy.get('.expert-form__repeatable-input .expert-form__input:last')
  }

  getClienExpertAvailabilityButtonList () {
    return cy.get('.availability-calendar__controls__inner  .button--primary')
  }

  getAvailabilityCalenderItem () {
    return cy
      .get('.availability-calendar__availability-item')
      .should('be.visible')
  }

  getScheduleButton () {
    return cy
      .get('.availability-calendar__availability-slot-action')
      .first()
      .should('be.visible')
  }

  getSchedulingConfirmButton () {
    return cy
      .get('.request-schedule__controls > .button--primary')
      .scrollIntoView()
      .should('be.visible')
  }

  getZoomMeetingConfirmButton () {
    return cy.get('[type="submit"]').should('be.visible')
  }

  getSchedulingCloseButton () {
    return cy.get('.request-schedule__controls > .button--secondary')
  }

  getCreateZoomMeetingList () {
    return cy.get('div.request-schedule__invite-action')
  }

  getSendCalendarInvitationButton () {
    return cy.get('[class*="modal__content modal"] .button--primary')
  }

  getTeamSelectionFieldDropdowm () {
    return cy.get(
      '[class*="modal__content modal"] button[class*="autocomplete__input--dropdown"]'
    )
  }

  getTeamSelectionDropdownList () {
    return cy.get(
      '[class*="modal__content modal"] .autocomplete__results-container div'
    )
  }

  getConfirmInterviewButton () {
    return cy
      .get('[class*="modal__content"] .button--primary')
      .scrollIntoView()
      .should('be.visible')
  }

  getCreateBundleButton () {
    return cy.get(
      '.message__action'
    ).contains('Create Bundle').should('be.visible')
  }

  getCurrencyTypeFieldList () {
    return cy.get(
      '.expert-form__section .expert-form__input-wrapper__inline-children button'
    )
  }

  getFeeValueAmountOnBundle () {
    return cy.get('[name="feeValue"]')
  }

  getInterviewDurationField () {
    return cy.get('[name="duration"]')
  }

  uncheckFreeCall () {
    cy.get('input[name="freeCallId"]').click()
    return cy.get('input[name="freeCallId"]').should('not.be.checked')
  }

  selectFeeType (feeType) {
    cy.get('label.expert-form__label')
      .contains('Fee type')
      .parent()
      .find('button.autocomplete__input--dropdown')
      .click()

    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(feeType)) {
        cy.wrap($el).click()
      }
    })

    return cy.get('label.expert-form__label')
      .contains('Fee type')
      .parent()
      .find('button.autocomplete__input')
      .should('have.text', feeType)
  }

  getHonorariumExpertName () {
    return cy.get('.expert-form__section input.autocomplete__input--disabled')
  }

  getHonorariumCostValue () {
    return cy.get('[name="costValue"]')
  }

  getStatusLabel () {
    return cy.get('.status-label-active')
  }

  getZoomMeetingConfirmationMessage () {
    return cy.get(
      '.request-schedule__invite-info .request-schedule__invite-item:nth-child(1)'
    )
  }

  getClientsConfirmationMessage () {
    return cy.get(
      '.request-schedule__invite-info .request-schedule__invite-item:nth-child(3)'
    )
  }

  getExpertConfirmationMessage () {
    return cy.get(
      '.request-schedule__invite-info .request-schedule__invite-item:nth-child(2)'
    )
  }

  getFreeCallCheckbox () {
    return cy.get('[name="freeCallId"]').should('be.visible')
  }

  getFreeCallCostType () {
    return cy.get('div.expert-form__input-wrapper div.autocomplete__container > button.autocomplete__input.autocomplete__input--dropdown.autocomplete__input--placeholder')
      .should('be.visible')
  }

  selectFreeCallCostType (costType) {
    this.getFreeCallCostType().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(costType)) {
        cy.wrap($el).click()
      }
    })
  }

  getCloseButton () {
    return cy.get('#smallcross')
  }

}

export default AvailabilitiesAndScheduling

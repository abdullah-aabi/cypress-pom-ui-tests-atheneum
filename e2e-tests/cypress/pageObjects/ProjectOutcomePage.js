class ProjectOutcomePage {
  getAutocompleteItems() {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('exist')
  }

  getDeliverableTypeDropdown() {
    return cy
      .get(
        '.expert-form__input-group__deliverable > :nth-child(2) > .autocomplete__container > .autocomplete__input'
      )
      .should('exist')
  }

  getCostTypeDropdown() {
    return cy
      .get(
        ':nth-child(2) > :nth-child(2) > .expert-form__input-wrapper > .autocomplete__container > .autocomplete__input'
      )
      .should('exist')
  }

  getExpertDropdown() {
    return cy.get('.expert-form__input>[id*="input"]').first().should('exist')
  }

  getDeliveredByDropdown() {
    return cy.get('.expert-form__input>[id*="input"]').last().should('exist')
  }

  getExistingDeliverableRadio() {
    return cy.get('.radio-input:last').should('exist')
  }

  getCostBillableToClientCheckbox() {
    return cy.get('[name="isBillableToClient"]').should('exist')
  }

  getCostValueCurrencyDropdown() {
    return cy
      .get(':nth-child(1) > .autocomplete__container > .autocomplete__input')
      .should('exist')
  }

  getCostValueCurrencyDropdownForBundleCreation() {
    return cy.get(':nth-child(4) > .expert-form__input-wrapper__inline-children > :nth-child(1)  .autocomplete__input')     
     .should('exist')
  }

  getFeeTypeDropdown() {
    return cy
      .get(':nth-child(2) > :nth-child(3) > .expert-form__input-wrapper > .autocomplete__container > .autocomplete__input')
      .should('exist')
  }

  selectDeliverableType(deliverableType) {
    this.getDeliverableTypeDropdown().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(deliverableType)) {
        cy.wrap($el).click()
      }
    })
    this.getDeliverableTypeDropdown().should('contain', deliverableType)
  }

  selectCostType(costType) {
    this.getCostTypeDropdown().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(costType)) {
        cy.wrap($el).click()
      }
    })
    this.getCostTypeDropdown().should('contain', costType)
  }

  selectFeeType(feeType) {
    this.getFeeTypeDropdown().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(feeType)) {
        cy.wrap($el).click()
      }
    })
    this.getFeeTypeDropdown().should('contain', feeType)
  }

  selectExpert(expertName) {
    this.getExpertDropdown().type(expertName)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(expertName)) {
        cy.wrap($el).click()
      }
    })
    this.getExpertDropdown()
      .invoke('attr', 'value')
      .then(expertValue => expect(expertValue).to.have.string(expertName))
  }

  selectDeliveredBy(deliveryName) {
    this.getDeliveredByDropdown().type(deliveryName)
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(deliveryName)) {
        cy.wrap($el).click()
      }
    })
    this.getDeliveredByDropdown()
      .invoke('attr', 'value')
      .then(deliveredByValue => expect(deliveredByValue).to.have.string(deliveryName))
  }
  selectCostCurrencyType(costCurrencyType) {
    this.getCostValueCurrencyDropdown().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(costCurrencyType)) {
        cy.wrap($el).click()
      }
    })
    this.getCostValueCurrencyDropdown().should('contain', costCurrencyType)
  }

  getFeeCurrencyDropdown() {
    return cy.get('[data-cy=currency-dropdown]').scrollIntoView().should('be.visible')
  }

  selectFeeCurrencyType(feeCurrencyType) {
    this.getFeeCurrencyDropdown().scrollIntoView().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(feeCurrencyType)) {
        cy.wait(1000)
        this.getFeeCurrencyDropdown().scrollIntoView()
        cy.wrap($el).scrollIntoView().click()
      }
    })
    this.getFeeCurrencyDropdown().should('contain', feeCurrencyType)
  }

  getFeeValueInput() {
    return cy.get('[name="feeValue"]').should('be.visible')
  }

  getCostValueInput() {
    return cy.get('[name="costValue"]').should('be.visible')
  }

  getDateInput() {
    return cy.get('.datepicker').should('be.visible')
  }

  selectCurrentDate() {
    this.getDateInput().click()
    return cy
      .get('[aria-current="date"]')
      .should('be.visible')
      .click()
  }

  getAddCostButton() {
    return cy.get('[data-cy="add-cost-btn"]').should('exist')
  }

  getAddClientChargeButton() {
    return cy.get('[data-cy="add-client-charge-btn"]').should('be.visible')
  }

  getSaveCostButton() {
    return cy
      .get('[data-cy="save-honorarium-fee-bundle-btn"]')
      .should('be.visible')
  }

  getGrossMarginMetricsValue() {
    return cy
      .get(
        ':nth-child(1) > :nth-child(2) > .progress-bar-indicator__info > .progress-bar-indicator__info__value'
      )
      .should('be.visible')
  }

  getGrossMarginMetricsPercentage() {
    return cy
      .get(
        ':nth-child(1) > :nth-child(2) > .progress-bar-indicator__info > .progress-bar-indicator__info__value'
      )
      .should('be.visible')
  }

  getFeesMetricsValue() {
    return cy
      .get(
        ':nth-child(2) > :nth-child(1) > .progress-bar-indicator__info > .right'
      )
      .should('be.visible')
  }

  getCostsMetricsValue() {
    return cy
      .get(
        ':nth-child(2) > :nth-child(2) > .progress-bar-indicator__info > .right'
      )
      .should('be.visible')
  }

  getDeliverableValue() {
    return cy.get('tbody > .title > :nth-child(1)').should('be.visible')
  }

  getCostTypeValue() {
    return cy.get('.text-wrapper > a').should('be.visible')
  }

  getExpertValue() {
    return cy.get('.desc').should('be.visible')
  }

  getCostDetailsPageLink() {
    return cy.get('a[href*="/fee/"]').should('be.visible')
  }

  getFreeCallOption() {
    return cy.get('input[name="freeCallId"]').should('be.visible')
  }

  getFreeCallType() {
    return cy.get('.autocomplete__container button').contains('Select a free call cost type').scrollIntoView()
  }

  selectFreeCallType(freecall) {
    this.getFreeCallType().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(freecall)) {
        cy.wrap($el).click()
      }
    })
  }

  getFeeValueForDiscountFeeFreeCall() {
    return cy.get('tr:nth-child(2) td:nth-child(8) .text-wrapper').should('be.visible')
  }

  getCostValueForDiscountFeeFreeCall() {
    return cy.get('tr:nth-child(2) td:nth-child(7) .text-wrapper').should('be.visible')
  }

  getCostValueForFreeCall() {
    return cy.get('tr:nth-child(3) td:nth-child(7) .text-wrapper').should('be.visible')
  }

  getFeeValueForFreeCall() {
    return cy.get('tr:nth-child(3) td:nth-child(8) .text-wrapper').should('be.visible')
  }

  getMarginValueForFreeCall() {
    return cy.get('tr:nth-child(3) td:nth-child(6) .text-wrapper').should('be.visible')
  }

  getMarginValueForDiscountFeeFreeCall() {
    return cy.get('tr:nth-child(2) td:nth-child(6) .text-wrapper').should('be.visible')
  }

  getTotalMargin() {
    return cy.get('tfoot td:nth-child(6)').should('be.visible')
  }
  getTotalCost() {
    return cy.get('tfoot td:nth-child(7)').should('be.visible')
  }

  getTotalFee() {
    return cy.get('tfoot td:nth-child(8)').should('be.visible')
  }

  selectCostCurrencyOnBundleCreation (costCurrencyType) {
    this.getCostValueCurrencyDropdownForBundleCreation().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(costCurrencyType)) {
        cy.wrap($el).click()
      }
    })
    this.getCostValueCurrencyDropdownForBundleCreation().should('contain', costCurrencyType)
  }

  getProposalFee () {
    return cy.get('tbody tr:nth-child(2) a').should('be.visible')
  }
}

export default ProjectOutcomePage

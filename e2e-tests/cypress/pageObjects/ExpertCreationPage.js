class ExpertCreationPage {
  getCreateExpertButton () {
    return cy.get('[data-cy=create-expert-btn]')
  }

  getHeading () {
    return cy.get('div.expert-form__input-group > h1')
  }

  getTitleField () {
    return cy.get('label.expert-form__label').contains('Title').parent().find('div.expert-bulk-create__dropdown__indicator')
  }

  getTitleContainerResults () {
    return cy.get('form .autocomplete__results-container')
  }

  getFirstNameField () {
    return cy.get('input[name*=firstName]')
  }

  getLastNameField () {
    return cy.get('input[name*=lastName]')
  }

  getLocationQuickSelectLabel () {
    return cy.get('div[class*="placeholder"]:contains("Location quick select")').parent()
  }

  selectLocationQuickSelect (city) {
    this.getLocationQuickSelectLabel().each((locationQuickSelect, index) => {
      cy.get(locationQuickSelect).find('input').type(city, { force: true })
      this.getReactOptions().contains(city).first().click()
      this.getCityField().eq(index).should('have.attr', 'value', city)
    })
  }

  getLocationQuickSelect () {
    return cy.get('div[class*="placeholder"]').contains('Location quick select').parent().find('input')
  }

  getCityField () {
    return cy.get('input[name*="address.city"]')
  }

  getExpertCreateDropdown () {
    return cy.get('div[class*="expert-bulk-create__dropdown__option"]').should('be.visible')
  }

  getAutoComplete () {
    return cy.get('.autocomplete__results-container').should('exist')
  }

  getReactOptions () {
    return cy.get('div[class="expert-form__input-group"] div[class*="menu"] div[class*="option"]')
  }

  selectLocation (cityName) {
    this.getLocationQuickSelect().type(cityName, { force: true })
    this.getReactOptions().contains(cityName).first().click()
    this.getCityField().should('have.attr', 'value', cityName)
  }

  selectCityField (cityName) {
    this.getCityField().type(cityName)
    this.getAutoComplete().each($el => {
      if ($el.text().includes(cityName)) {
        cy.wrap($el).click()
      }
    })
  }

  getCurrencyField () {
    return cy.get('label.expert-form__label').contains('Hourly rate').parent().find('div.expert-bulk-create__dropdown__input input')
  }

  getCountry () {
    return cy.get('label.expert-form__label').contains('Country').parent().find('div.expert-bulk-create__dropdown__single-value')
  }

  getHourlyRateField () {
    return cy.get('input[name*="expert.hourlyRate"]').should('be.visible')
  }

  getCheckboxUSGovEmployee () {
    return cy.get('label.checkbox__wrapper').contains('Current US Government employee').find('input.checkbox').should('exist')
  }

  selectCurrencyField (currencyName) {
    this.getCurrencyField()
      .should('exist')
      .type(currencyName, { force: true })
    this.getReactOptions().contains(currencyName).first().click()
  }

  getIndustryField () {
    return cy.get('label.expert-form__label:contains("Industry / SubIndustry")')
      .parent()
  }

  selectIndustryField (industryName) {
    this.getIndustryField().each((industryField, index) => {
      cy.get(industryField).find('div.expert-bulk-create__dropdown__input input').type(industryName, { force: true })
      this.getReactOptions().contains(industryName).first().click()
      cy.get(industryField).find('.expert-bulk-create__dropdown__multi-value__label').should('have.text', industryName)
    })
  }

  getLanguageField () {
    return cy.get('label.expert-form__label').contains('Languages').parent().find('div.expert-form__repeatable-input-wrapper div.expert-form__input-wrapper').first().find('div.expert-bulk-create__dropdown__input input')
  }

  selectLanguageField (languageName) {
    this.getLanguageField()
      .should('exist')
      .type(languageName, { force: true })
    this.getReactOptions()
      .contains(languageName)
      .first()
      .click()
  }

  getLanguageProficiency () {
    return cy.get('div.expert-form__input-group')
      .contains('Languages')
      .parent()
      .find('div.expert-form__repeatable-input-wrapper div.expert-form__input-wrapper')
      .last()
      .find('div.expert-bulk-create__dropdown__input input')
  }

  selectLanguageProficiency (languageProficiency) {
    this.getLanguageProficiency()
      .should('exist')
      .type(languageProficiency, { force: true })
    this.getReactOptions().contains(languageProficiency).first().click()
  }

  getIndustryExperienceField () {
    return cy.get('label.expert-form__label').contains('Relevance Statement').scrollIntoView().parent().find('.fr-element > div')
  }

  fillIndustryExperiencePDL (industryExperience) {
    cy.get('label.expert-form__label:contains("Relevance Statement")').each(industryExperienceField =>
      cy.get(industryExperienceField).scrollIntoView().parent().find('.fr-element > div').type(industryExperience))
  }

  getPositionField () {
    return cy.get('label.expert-form__label:contains("Position")').parent()
  }

  selectPositionField (positionName) {
    this.getPositionField().each((positionField) => {
      cy.get(positionField).find('div.expert-bulk-create__dropdown__input input').type(positionName, { force: true })
      this.getReactOptions().contains(positionName).first().click()
      cy.get(positionField).find('.expert-bulk-create__dropdown__single-value').should('have.text', positionName)
    })
  }

  getCompanyField () {
    return cy.get('label.expert-form__label:contains("Company")').parent()
  }

  selectCompanyField (companyName) {
    this.getCompanyField().each((companyField) => {
      cy.get(companyField).find('div.expert-bulk-create__dropdown__input input').type(companyName, { force: true })
      this.getReactOptions().contains(companyName).first().click()
      cy.get(companyField).find('.expert-bulk-create__dropdown__single-value').should('have.text', companyName)
    })
  }

  getFromDateField () {
    return cy.get(':nth-child(1) > .datepicker__wrapper > .datepicker')
  }

  getToDateField () {
    return cy.get(':nth-child(3) > .datepicker__wrapper > .datepicker')
  }

  getCalendarMonthOptions () {
    return cy.get('[class="monthpicker__month"]').should('exist')
  }

  selectFromDateField () {
    this.getFromDateField().each(getFromDate => {
      cy.get(getFromDate).should('exist')
        .click({ force: true })
      this.getCalendarMonthOptions().first()
        .click({ force: true })
    })
  }

  selectToDateField () {
    this.getToDateField().each(getToDate => {
      cy.get(getToDate).should('exist')
        .click({ force: true })
      this.getCalendarMonthOptions().last()
        .click({ force: true })
    })
  }

  getDatePickerCurrentCheckbox () {
    return cy.get('.m-l-xl > .checkbox')
  }

  getEmailFieldLabel () {
    return cy.get('label.expert-form__label:contains("Primary email")')
  }

  getEmailField () {
    return cy.get('label.expert-form__label:contains("Primary email")').parent().find('input[name*=email]')
  }

  getPhoneNumField () {
    return cy.get('input[name*="phoneNum"]')
  }

  getProfLinkField () {
    return cy.get('input[name*="professionalLinkUrl"]')
  }

  getExpertSaveButton () {
    return cy.get('div.expert-form__section button.button--primary')
  }

  getAddedRowForEmail () {
    return cy.get('input[name="experts.0.address.emails.0.email"]').scrollIntoView().should('be.visible')
  }
}
export default ExpertCreationPage

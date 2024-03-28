class EmployeesPage {
  loginAsEmployee (employeeName) {
    cy.waitForLoadingDisappear()
    cy.get('.filter-input__with-button').type(`${employeeName}{enter}`)
    cy.waitForLoadingDisappear()
    cy.get('div.search-item')
      .should('contain', employeeName)
      .each(($el, index, $list) => {
        const text = $el.text()
        cy.log(text)
        if (text.includes(employeeName)) {
          cy.wrap($el).click()
        }
      })
    cy.get('.expert-wrapper .action a')
      .should('be.visible')
      .click()

    cy.get('.modal__content .word-break-all')
      .should('be.visible')
      .then(function ($elem) {
        let authToken = $elem
          .text()
          .match(/token=(.*)&location/)
          .pop()
        cy.requestPostQuickLogin(authToken).then(quickLoginResponse => {
          cy.setLocalStorageLoginInfo(quickLoginResponse.body.user, authToken)
          cy.reload()
        })
      })

    cy.waitForLoadingDisappear()

    cy.get('.header__actions__navigation__user p').should(
      'have.text',
      employeeName
    )
  }

  loginFromInterface (username, password) {
    cy.get('[name=login]')
      .should('be.visible')
      .type(username)
    cy.get('[name=password]')
      .should('be.visible')
      .type(password)
    cy.get('.button--primary')
      .should('be.visible')
      .click()
  }

  getAddNewEmployeeButton () {
    return cy.get('.search-panel-container__wrapper button.button--primary').contains('Add new employee').should('be.visible')
  }

  getCreateEmployeeTitle () {
    return cy.get('.expert-form__title').should('be.visible')
  }

  getAutocompleteItems () {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]').should('exist')
  }

  getEmployeeTitle () {
    return cy.get(
      'button.autocomplete__input'
    ).contains('Select title').should('exist')
  }

  selectEmployeeTitle (employeeTitle) {
    this.getEmployeeTitle().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(employeeTitle)) {
        cy.wrap($el).click()
      }
    })
  }

  getFirstNameTextField () {
    return cy.get('[name="firstName"]').should('be.visible')
  }

  getLastNameTextField () {
    return cy.get('[name="lastName"]').should('be.visible')
  }

  getPhonesTypeField () {
    return cy.get(
      'button.autocomplete__input'
    ).contains('office')
      .scrollIntoView()
  }

  selectPhoneType (phoneType) {
    this.getPhonesTypeField().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(phoneType)) {
        cy.wrap($el).click()
      }
    })
  }

  getPhonesField () {
    return cy.get('[name="address.phones[0].phoneNum"]').scrollIntoView().should('be.visible')
  }

  getEmailsField () {
    return cy.get('[name="email"]').scrollIntoView().should('be.visible')
  }

  getAtheneumOfficeField () {
    return cy.get(
      'button.autocomplete__input'
    ).contains('Select an office')
      .first()
      .scrollIntoView()
      .should('be.visible')
  }

  selectAtheneumOffice (atheneumOfficeName) {
    this.getAtheneumOfficeField().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(atheneumOfficeName)) {
        cy.wrap($el).click()
      }
    })
  }

  getEmployeePositionField () {
    return cy.get(
      'button.autocomplete__input'
    ).contains('Select a position')
      .scrollIntoView()
      .should('be.visible')
  }

  selectEmployeePosition (employeePosition) {
    this.getEmployeePositionField().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(employeePosition)) {
        cy.wrap($el).click()
      }
    })
  }

  getPositionDescriptionField () {
    return cy
      .get('[name="currentPosition.positionDescription"]')
      .scrollIntoView()
      .should('be.visible')
  }

  getHourlyRateField () {
    return cy.get(
      'button.autocomplete__input'
    ).contains('Currency')
      .scrollIntoView()
      .should('be.visible')
  }

  selectHourlyRate (hourlyRate) {
    this.getHourlyRateField().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(hourlyRate)) {
        cy.wrap($el).click()
      }
    })
  }

  getAmountField () {
    return cy.get('[name="currentPosition.hourlyRate"]').scrollIntoView().should('be.visible')
  }

  getPayrollEntity () {
    return cy.get(
      'button.autocomplete__input'
    ).contains('Select an office')
      .last()
      .scrollIntoView()
      .should('be.visible')
  }

  selectPayrollEntity (payrollEntity) {
    this.getPayrollEntity().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(payrollEntity)) {
        cy.wrap($el).click()
      }
    })
  }

  getLanguageField () {
    return cy.get('[data-cy="language-fields-language"]').scrollIntoView()
  }

  selectLanguage (language) {
    this.getLanguageField().type(language)
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(language)) {
        cy.wrap($el).click()
      }
    })
  }

  getLanguageProficiencyField () {
    return cy.get('[data-cy="language-fields-proficiency"]').scrollIntoView()
  }

  selectLanguageProficiency (languageProficiency) {
    this.getLanguageProficiencyField().click()
    this.getAutocompleteItems().each(($el, index) => {
      if ($el.text().includes(languageProficiency)) {
        cy.wrap($el).click()
      }
    })
  }

  getSaveButton () {
    return cy.get('[type="submit"]').scrollIntoView().should('be.visible')
  }

  getNewHireUntil () {
    return cy.get('.datepicker').scrollIntoView().should('be.visible')
  }

  getleftIconOnCalendar () {
    return cy.get('.calendar-label--iconRight').scrollIntoView().should('be.visible')
  }

  selectHireUntilMonth (month) {
    cy.get('ul.calendar li').each(($el, index, $list) => {
      const text = $el.text()
      if (text.includes(month)) {
        cy.get('ul.calendar li')
          .eq(index)
          .click()
      }
    })
  }

  getSearchTextBox () {
    return cy.get('.filter-input__with-button').should('be.visible')
  }

  getSearchButton () {
    return cy.get('.filter-input__with-button .button--primary').should('be.visible')
  }

  getTargetMarginField () {
    return cy.get('[name="currentPosition.targetMargin"]').scrollIntoView().should('be.visible')
  }
  getSearchResults () {
    return cy.get('.search-item').should('be.visible')
  }

  getEmployeeName () {
    return cy.get('.name-status-wrapper h1').should('be.visible')
  }
  getEmployeeHeader () {
    return cy.get('.code-label').should('be.visible')
  }

  getEmployeeLanguage () {
    return cy.get(
      ':nth-child(1) > .story > .group-wrapper > .group > :nth-child(1) > .row__value'
    )
  }

  getAtheneumOffice () {
    return cy.get(
      'div.col-2:nth-child(1) div.row:nth-child(2) > span.row__value'
    )
  }

  getEmployeePosition () {
    return cy.get(
      'div.col-2:nth-child(1) div.row:nth-child(3) > span.row__value'
    )
  }

  getPositionDescription () {
    return cy.get(
      'div.col-2:nth-child(1) div.row:nth-child(4) > span.row__value'
    ).should('be.visible')
  }

  getHourlyRate () {
    return cy.get(
      'div.col-2:nth-child(1)  div:nth-child(5) div.row > span.row__value'
    )
  }

  getEmployeePhone () {
    return cy.get(
      'div.col-2.col-2--padding:nth-child(2)  div.group div.row:nth-child(1) > span.row__value'
    )
  }

  getEmployeeEmail () {
    return cy.get(
      'div.col-2.col-2--padding:nth-child(2)  div.group div.row:nth-child(2) > span.row__value'
    ).should('be.visible')
  }

  getRydooPayrollEntity () {
    return cy
      .get('div.group:nth-child(2) div.row:nth-child(6) > span.row__value')
      .scrollIntoView()
  }

  getEditEmployeeButton () {
    return cy.get('.inline .action').contains('Edit').should('be.visible')
  }

  getClearSearchButton () {
    return cy.get('.row--link').should('be.visible')
  }
}

export default EmployeesPage

/// <reference types="Cypress" />
import generator from '../../../support/generator'
import EmployeesPage from '../../../pageObjects/EmployeesPage'

describe('Creating Employee by Admin', { tags: ["regression", "smoke"] }, function () {
  let employeeDetails
  const employeesPage = new EmployeesPage()
  const firstName = generator.generateFirstName()
  const lastName = generator.generateLastName()
  const originalName = `${firstName} ${lastName}`
  const email = `${firstName + lastName}@mail.com`
  const updatedLastName = generator.generateLastName()
  const updatedEmail = `${firstName + updatedLastName}@mail.com`

  before(function () {
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/login`).as('loginRequest')
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.requestLogIn(
      Cypress.env('CYPRESS_ADMIN_USERNAME'),
      Cypress.env('CYPRESS_ADMIN_PASSWORD')
    ).then(loginResponse => {
      cy.setLocalStorageLoginInfo(
        loginResponse.body.user,
        loginResponse.body.token
      )
    })

    cy.fixture('employeeDetails').then(employeedetails => {
      employeeDetails = employeedetails
    })
  })

  it('Should create new Employee as Admin', function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/employee-search`)
    cy.intercept('GET', '/api/employee/*').as('waitForEmployeeDetailsToCreate')

    employeesPage
      .getAddNewEmployeeButton()
      .click()

    employeesPage
      .selectEmployeeTitle(employeeDetails.principal.title)

    employeesPage
      .getFirstNameTextField()
      .type(firstName)

    employeesPage
      .getLastNameTextField()
      .type(lastName)

    employeesPage.selectPhoneType(employeeDetails.principal.phoneType)

    employeesPage
      .getPhonesField()
      .type(employeeDetails.principal.phoneNum)

    employeesPage
      .getEmailsField()
      .type(email)

    employeesPage.selectAtheneumOffice(employeeDetails.principal.atheneumOffice)

    employeesPage.selectEmployeePosition(employeeDetails.principal.employeePosition)

    employeesPage
      .getPositionDescriptionField()
      .type(employeeDetails.principal.positionDescription)

    employeesPage.selectHourlyRate(employeeDetails.principal.currency)

    employeesPage
      .getAmountField()
      .type(employeeDetails.principal.hourlyRate)

    employeesPage.selectPayrollEntity(
      employeeDetails.principal.rydooPayrollEntity
    )

    employeesPage.selectLanguage(employeeDetails.principal.languages[0].name)

    employeesPage.selectLanguageProficiency(
      employeeDetails.principal.languages[0].languageProficiency
    )

    employeesPage
      .getNewHireUntil()
      .click()

    employeesPage
      .getleftIconOnCalendar()
      .click()

    employeesPage.selectHireUntilMonth(employeeDetails.principal.hireUntil)

    employeesPage
      .getTargetMarginField()
      .type(employeeDetails.principal.targetMargin)

    employeesPage
      .getSaveButton()
      .click()

    cy.wait('@waitForEmployeeDetailsToCreate')
      .its('response.statusCode')
      .should('eq', 200)

    employeesPage
      .getEmployeeName()
      .contains(firstName)
      .contains(lastName)

    employeesPage
      .getEmployeeHeader()
      .contains(employeeDetails.principal.employeePosition)
      .contains(employeeDetails.principal.atheneumOffice)

    employeesPage
      .getEmployeeLanguage()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.eq(
          employeeDetails.principal.languages[0].name +
          ' (' +
          employeeDetails.principal.languages[0].languageProficiency +
          ')'
        )
      })

    employeesPage
      .getAtheneumOffice()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(employeeDetails.principal.atheneumOffice)
      })

    employeesPage
      .getEmployeePosition()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(employeeDetails.principal.employeePosition)
      })

    employeesPage
      .getPositionDescription()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(employeeDetails.principal.positionDescription)
      })

    employeesPage
      .getHourlyRate()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(
          employeeDetails.principal.hourlyRate +
          ' ' +
          employeeDetails.principal.currency
        )
      })

    employeesPage
      .getEmployeePhone()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(employeeDetails.principal.phoneNum)
      })

    employeesPage
      .getEmployeeEmail()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(email)
      })

    employeesPage
      .getRydooPayrollEntity()
      .should('be.visible')
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(employeeDetails.principal.rydooPayrollEntity)
      })
  })

  it('Should search and edit the employee details', function () {
    cy.intercept('PUT', '/api/employee/*').as('waitForEmployeeDetailsToBeEdited')

    employeesPage
      .getClearSearchButton()
      .click()

    employeesPage
      .getSearchTextBox()
      .type(originalName)

    employeesPage
      .getSearchButton()
      .click()

    employeesPage
      .getSearchResults()
      .should('have.length', 1)
      .contains(originalName)
      .click()

    employeesPage
      .getEditEmployeeButton()
      .click()

    employeesPage
      .getCreateEmployeeTitle()
      .contains(employeeDetails.editTitle)

    employeesPage
      .getLastNameTextField()
      .clear()
      .type(updatedLastName)

    employeesPage
      .getEmailsField()
      .clear()
      .type(updatedEmail)

    employeesPage
      .getPositionDescriptionField()
      .clear()
      .type(employeeDetails.editPrincipal.positionDescription)

    employeesPage
      .getSaveButton()
      .click()

    cy.wait('@waitForEmployeeDetailsToBeEdited')
      .its('response.statusCode')
      .should('eq', 200)

    cy.waitForLoadingDisappear()

    employeesPage
      .getEmployeeName()
      .should('contain.text', updatedLastName)

    employeesPage
      .getEmployeeEmail()
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(updatedEmail)
      })

    employeesPage
      .getPositionDescription()
      .then($el => {
        const text = $el.text()
        expect(text).to.equal(employeeDetails.editPrincipal.positionDescription)
      })
  })
})

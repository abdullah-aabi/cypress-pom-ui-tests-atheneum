/* eslint-disable no-unused-expressions */
/// <reference types="Cypress" />
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import ExpertCreationPage from '../../../pageObjects/ExpertCreationPage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import generator from '../../../support/generator'

describe('Creating New Expert', { tags: ["regression", "smoke"] }, function () {
  let expertData, expertIdOfCreatedExpert, expertId
  const expertSearchPage = new ExpertSearchPage()
  const expertCreationPage = new ExpertCreationPage()
  const expertDetailsPage = new ExpertDetailsPage()

  const expertFirstName = generator.generateFirstName()
  const expertLastName = generator.generateLastName()
  const expertEmail = `${expertFirstName + expertLastName}@gmail.com`
  const expertEditEmail = `${expertFirstName + expertLastName}1@gmail.com`

  before(function () {
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/login`).as('loginRequest')
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.fixture('testUsers').then(testUsers => {

      cy.requestLogIn(
        testUsers.erm.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        cy.setLocalStorageLoginInfo(
          loginResponse.body.user,
          loginResponse.body.token
        )
      })
    })

    cy.fixture('expertDetails').then(expertDetails => {
      expertData = expertDetails
    })
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
  })

  it('should create new expert', function () {
    expertSearchPage.getCreateNewExpertButton().click()
    expertCreationPage.getHeading().contains('Name not set')
    expertCreationPage.getTitleField().click()
    expertCreationPage
      .getExpertCreateDropdown()
      .first()
      .click()
    expertCreationPage.getFirstNameField().type(expertFirstName)
    expertCreationPage.getLastNameField().type(expertLastName)
    expertCreationPage.selectLocation(expertData.city)
    expertCreationPage.selectIndustryField(expertData.industry)
    expertCreationPage.selectLanguageField(expertData.language)
    expertCreationPage.selectLanguageProficiency('Full')
    expertCreationPage
      .getIndustryExperienceField()
      .type(expertData.industryExperience)

    expertCreationPage.selectPositionField(expertData.position)
    expertCreationPage.selectCompanyField(expertData.company)
    expertCreationPage.selectFromDateField()
    expertCreationPage.getDatePickerCurrentCheckbox().check()
    expertCreationPage.getEmailField().type(expertEmail)
    expertCreationPage.getExpertSaveButton().click()

    expertDetailsPage.getExpertName().contains(`${expertFirstName} ${expertLastName}`)
    expertDetailsPage.getCity().contains(expertData.city)
    expertDetailsPage.getIndustry().contains(expertData.industry)
    expertDetailsPage
      .getIndustryExperience()
      .should('have.text', expertData.industryExperience)
    expertDetailsPage.getEmail().contains(expertEmail)
    expertDetailsPage.getPosition().contains(expertData.position)
    expertDetailsPage.getCompany().contains(expertData.company)

    expertDetailsPage.getSherlock().should('not.exist')

    expertDetailsPage
      .getRowName('Current US Government employee')
      .should(
        'have.text',
        'No'
      )

    expertDetailsPage
      .getExpertIdForSelectedOrGeneratedExpert()
      .invoke('text')
      .then(text => {
        expertIdOfCreatedExpert = text
        var pattern = /[0-9]+/g
        expertId = expertIdOfCreatedExpert.match(pattern)
        cy.log(expertId)
      })
  })

  it('Should edit and verify Expert details', function () {
    expertDetailsPage
      .getEditButton()
      .should('be.visible')
      .click()

    expertCreationPage
      .getIndustryExperienceField()
      .clear()
      .type(expertData.editIndustryExperience)

    expertCreationPage.getHourlyRateField().type(expertData.currencyAmount)
    expertCreationPage.selectCurrencyField(expertData.currencyType)
    expertCreationPage.getCheckboxUSGovEmployee().click()

    expertCreationPage
      .getEmailField()
      .should('be.visible')
      .clear()
      .type(expertEditEmail)

    expertCreationPage
      .getExpertSaveButton()
      .should('be.visible')
      .click()

    expertDetailsPage
      .getIndustryExperience()
      .should('have.text', expertData.editIndustryExperience)
    expertDetailsPage.getEmail().contains(expertEditEmail)

    expertDetailsPage
      .getRowName('Hourly rate')
      .should(
        'have.text',
        `${expertData.currencyAmount} ${expertData.currencyType}`
      )
    expertDetailsPage
      .getRowName('Current US Government employee')
      .should(
        'have.text',
        'Yes'
      )
  })

  it('Delete an Expert', function () {
    expertDetailsPage.getDeleteButton().click()
    expertDetailsPage.getDeleteButtonOnConfirmationPopUp().click()
    expertDetailsPage
      .getDeleteConfirmationMessage()
      .contains(expertData.deleteExpertConfirmationMessage)
    expertDetailsPage
      .getCloseIconOfNotification()
      .should('be.visible')
      .click()
  })
})

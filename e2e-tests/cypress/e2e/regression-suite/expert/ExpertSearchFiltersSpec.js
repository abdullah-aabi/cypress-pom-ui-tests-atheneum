import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
const initExpertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')
const faker = require('faker')

const {
  getRandomInt,
  generateFirstName,
  generateLastName,
  generateTestName
} = require('../../../support/generator')

describe('Expert relationship manager searching for experts', { tags: "regression" }, function () {
  let authToken,
    expertsData,
    createdExpert,
    createdExpertPastExperience,
    staticDataResponse

  const companyName = faker.company.companyName()
  const pastCompanyName = faker.company.companyName()

  const expertSearchPage = new ExpertSearchPage()
  const globalPage = new GlobalPage()

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
        authToken = loginResponse.body.token
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
          expertCreateObject.firstName = generateFirstName()
          expertCreateObject.lastName = generateLastName()
          expertCreateObject.originalName = `${expertCreateObject.firstName} ${expertCreateObject.lastName
            }`
          expertCreateObject.email = `${expertCreateObject.firstName +
            expertCreateObject.lastName}@mail.com`
          expertCreateObject.address.phones[0].phoneNum = faker.phone.phoneNumber('+48 ## ### ## ##')
          expertCreateObject.expert.industryExpertise = expertCreateObject.expert.industryExpertise.replace('Automation', generateTestName())
          expertCreateObject.experiences[0].company = companyName

          cy.requestCreateExpert(authToken, expertCreateObject).then(
            expertCreateResponse => {
              createdExpert = expertCreateResponse.body
            }
          )
        })

        cy.fixture('expertDetails').then(expertDetails => {
          cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = generateFirstName()
            expertCreateObject.lastName = generateLastName()
            expertCreateObject.originalName = `${expertCreateObject.firstName
              } ${expertCreateObject.lastName}`
            expertCreateObject.email = `${expertCreateObject.firstName +
              expertCreateObject.lastName}@mail.com`
            expertCreateObject.experiences = expertDetails.experiences
            expertCreateObject.address.phones[0].phoneNum = faker.phone.phoneNumber('+48 ## ### ## ##')
            expertCreateObject.expert.industryExpertise = expertCreateObject.expert.industryExpertise.replace('Automation', generateTestName())
            expertCreateObject.experiences[1].company = pastCompanyName

            cy.requestCreateExpert(authToken, expertCreateObject).then(
              expertCreateResponse => {
                createdExpertPastExperience = expertCreateResponse.body
              }
            )
          })
        })

        cy.requestGetStaticData(authToken).then(staticData => {
          staticDataResponse = staticData.body
        })

        globalPage.expandFilterMenu('Experience Period')
        globalPage.expandFilterMenu('Geography')
        globalPage.expandFilterMenu('Contacts')
        globalPage.expandFilterMenu('Created in')
      })
    })
  })

  beforeEach(function () {
    cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchCall')
    cy.intercept('GET', `${Cypress.env('SEARCH_SERVICE_URL')}/menu*`).as('expertQuickSearchCall')

    cy.requestSearchExperts(authToken, initExpertSearchRequestBody).then(
      expertSearchResult => {
        const randomExpertIndex = getRandomInt(
          expertSearchResult.body.hits.hits.length
        )
        cy.requestGetExpertById(
          authToken,
          expertSearchResult.body.hits.hits[randomExpertIndex]._source.id
        ).then(expertResponseData => {
          expertsData = expertResponseData.body
        })
      }
    )
    globalPage.getClearSearchButton().click()
  })

  it('should search the expert by keyword or phrase', function () {
    const expertKeyword = `"${createdExpert.expert.industryExpertise
      .replace('<p>', '')
      .replace('</p>', '')}"`
    expertSearchPage.getKeywordField().type(`${expertKeyword}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should verify search result of keyword or phrase in expert`s profile', function () {

    expertSearchPage.getKeywordField().type(`Head of Purchasing{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)

    expertSearchPage.getExpertSearchList().should('be.visible').first().click()
    cy.waitForLoadingDisappear()
    expertSearchPage.getHighlightedText().scrollIntoView().should('contain.text', 'Head of Purchasing').
      should('have.attr', 'style', 'background-color:#FFD700 !important; z-index:10;')

    cy.contains('Director Purchasing').should('not.contain.attr', 'style', 'background-color:#FFD700 !important; z-index:10;')
  })

  it('should search the expert by phrase and boolean operators', function () {
    const expertKeyword = '"Expertise" NOT * Purchasing'
    expertSearchPage.getKeywordField().type(`${expertKeyword}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search the expert by name', { tags: "smoke" }, function () {
    expertSearchPage
      .getExpertNameField()
      .type(`${createdExpert.fullName}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search the expert by email', function () {
    expertSearchPage.getExpertNameField().type(`${createdExpert.email}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search the expert by phone', function () {
    expertSearchPage
      .getExpertNameField()
      .type(`${createdExpert.address.phones[0].phoneNum}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)

  })

  it('should search the expert by expert code', function () {
    expertSearchPage
      .getExpertNameField()
      .type(`${expertsData.expert.expertCode}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search the experts by including screening information', function () {
    expertSearchPage
      .getExpertFiltersCheckbox()
      .contains('screening information')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search the experts by interviewed true', function () {
    expertSearchPage
      .getExpertFiltersCheckbox()
      .contains('Interviewed')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Company', { tags: "smoke" }, function () {
    cy.selectFilterByCriteria('Company', 'Atheneum{enter}')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search by name and filter by Position', { tags: "smoke" }, function () {
    expertSearchPage
      .getExpertNameField()
      .type(`${createdExpert.fullName}{enter}`)
    cy.selectFilterByCriteria(
      'Position',
      `${createdExpert.cv.experiences[0].position.name}{enter}`
    )
    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter Company and by Past and Current Position', function () {

    cy.selectFilterByCriteria('Company', `${companyName}{enter}`)
    cy.selectFilterByCriteria('Position', `${createdExpert.cv.experiences[0].position.name}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter by Company and Current Position', function () {
    expertSearchPage.selectFilterWithButton(
      'Present and past positions',
      'Present positions only'
    )
    cy.selectFilterByCriteria('Company', `${companyName}{enter}`)
    cy.selectFilterByCriteria('Position', `${createdExpert.cv.experiences[0].position.name}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter by Company and Past Position', function () {
    expertSearchPage.selectFilterWithButton(
      'Present and past positions',
      'Past positions only'
    )
    cy.selectFilterByCriteria('Company', `${pastCompanyName}{enter}`)
    cy.selectFilterByCriteria('Position', `${createdExpertPastExperience.cv.experiences[1].position.name}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Active Status', function () {
    expertSearchPage
      .getExpertFiltersCheckbox()
      .contains('Active')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts with Compliance', function () {
    expertSearchPage
      .getExpertFiltersRadiobutton()
      .contains('With compliance')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts without Compliance', function () {
    expertSearchPage
      .getExpertFiltersRadiobutton()
      .contains('Without compliance')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts with HF Compliance', function () {
    expertSearchPage
      .getExpertFiltersRadiobutton()
      .contains('With HF compliance')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts without HF Compliance', function () {
    expertSearchPage
      .getExpertFiltersRadiobutton()
      .contains('Without HF compliance')
      .click()

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by country', function () {
    const country = staticDataResponse.countries.filter(
      country => country.id === expertsData.address.countryId
    )[0].name
    cy.selectFilterByLocation('Country', `${country}{enter}`, 0)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by state', function () {
    const state = (JSON.stringify(expertsData.address.state)).replaceAll('"', '')
    cy.selectFilterByLocation('Geography', `${state}{enter}`, 1)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })


  it('should filter the experts by Industry', function () {
    const industryName = staticDataResponse.industries.filter(
      industry => industry.id === expertsData.expert.industryId
    )[0].name
    cy.selectFilterByCriteria('Industries', `${industryName}{enter}`)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by language and proficiency', function () {
    const language = staticDataResponse.languages.filter(
      language => language.id === expertsData.languages[0].id
    )[0].name
    const languageProficiency = staticDataResponse.languageProficiencies.filter(
      language =>
        language.id ===
        expertsData.languages[0].languageToUser.languageProficiencyId
    )[0].name
    cy.selectFilterByCriteria('Languages', `${language}{enter}`, true)
    expertSearchPage.selectFilterWithButton('Proficiency', languageProficiency)

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - Email', function () {
    globalPage.clickCheckBoxByName('Email')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - HasApp', function () {
    globalPage.clickCheckBoxByName('App')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - Personal phone', function () {
    globalPage.clickCheckBoxByName('Personal phone')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - Office phone', function () {
    globalPage.clickCheckBoxByName('Office phone')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - Mobile phone', function () {
    globalPage.clickCheckBoxByName('Mobile phone')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - Direct phone', function () {
    globalPage.clickCheckBoxByName('Direct phone')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Contacts - WhatsApp', function () {
    globalPage.clickCheckBoxByName('WhatsApp')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should filter the experts by Created in - 2022', function () {
    globalPage.clickCheckBoxByName('2022')

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  // Skipped as this option is removed from Expert-search
  it.skip('should filter the experts by Similar to', function () {
    cy.selectFilterByCriteria(
      'Experts similar to',
      `${expertsData.fullName}{enter}`
    )

    cy.wait('@expertSearchCall').its('response.statusCode').should('equal', 200)
  })

  it('should search the expert by expert name using Search Anything method', function () {
    globalPage.getSearchAnythingInput().type(createdExpert.fullName)
    globalPage
      .getSearchAnythingResults()
      .should('contain.text', createdExpert.fullName)

    cy.wait('@expertQuickSearchCall').its('response.statusCode').should('equal', 200)
  })
})

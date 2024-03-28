import GlobalPage from '../../../pageObjects/GlobalPage'
import AccountSearchPage from '../../../pageObjects/AccountSearchPage'

describe('Account manager searching for accounts', { tags: "regression" }, function () {
  let testUsers,
    accountsData

  const accountSearchPage = new AccountSearchPage()
  const globalPage = new GlobalPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.fixture('testData').then(data => {
      accountsData = data
    })

    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers

      cy.requestLogIn(
        testUsers.accountManager.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        cy.setLocalStorageLoginInfo(
          loginResponse.body.user,
          loginResponse.body.token
        )

        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-search')
      })
    })
  })

  beforeEach(function () {
    globalPage.getProfileHeaderIcon().click()
    globalPage.getClearSearchButton().click()
    cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/list-records`).as('accountSearchRequest')
    cy.intercept('GET', `${Cypress.env('SEARCH_SERVICE_URL')}/menu*`).as('quickSearchCall')
  })

  it('should search the parent account by account name', function () {
    accountSearchPage
      .getSearchInput()
      .type(`${accountsData.parentAccountName}{enter}`)
    cy.wait('@accountSearchRequest').its('response.statusCode').should('eq', 200)
  })

  it('should search the parent account by account code', function () {
    accountSearchPage
      .getSearchInput()
      .type(`${accountsData.parentAccountCode}{enter}`)
    cy.wait('@accountSearchRequest').its('response.statusCode').should('eq', 200)
  })

  it('should search the parent account by account name, expand the accounts list and expand the office list', function () {
    accountSearchPage
      .getSearchInput()
      .type(`${accountsData.parentAccountName}{enter}`)
    cy.wait('@accountSearchRequest').its('response.statusCode').should('eq', 200)
  })

  it('should search the accounts by Parent Account', function () {
    accountSearchPage
      .getFilterOption()
      .contains('Parent account')
      .click()
    accountSearchPage
      .getSearchInput()
      .type(`${accountsData.parentAccountName}{enter}`)
    cy.wait('@accountSearchRequest').its('response.statusCode').should('eq', 200)
  })

  it('should search the accounts by Account', function () {
    accountSearchPage
      .getFilterOption()
      .contains('Account')
      .click()

    accountSearchPage
      .getSearchInput()
      .type(`${accountsData.parentAccountName}{enter}`)
    cy.wait('@accountSearchRequest').its('response.statusCode').should('eq', 200)
  })

  it('should search the accounts by Office', function () {
    accountSearchPage
      .getFilterOption()
      .contains('Office')
      .click()
    accountSearchPage
      .getSearchInput()
      .type(`${accountsData.parentAccountName}{enter}`)
    cy.wait('@accountSearchRequest').its('response.statusCode').should('eq', 200)
  })

  it('should search the parent account by account name using Search Anything method', function () {
    globalPage
      .getSearchAnythingInput()
      .type(accountsData.parentAccountName)
    globalPage
      .getSearchAnythingResults()
      .should('contain.text', accountsData.parentAccountName)

    cy.wait('@quickSearchCall').its('response.statusCode').should('eq', 200)
  })

  it('should search the account by account name using Search Anything method', function () {
    globalPage.getSearchAnythingInput().type(accountsData.accountName)
    globalPage
      .getSearchAnythingResults()
      .should('contain.text', accountsData.accountName)

    cy.wait('@quickSearchCall').its('response.statusCode').should('eq', 200)
  })

  it('should search the office by office name using Search Anything method', function () {
    globalPage.getSearchAnythingInput().type(accountsData.officeName)
    globalPage.getSearchAnythingResults().should('contain.text', accountsData.officeName)

    cy.wait('@quickSearchCall').its('response.statusCode').should('eq', 200)
  })
})

const initAccountSearchRequestBody = require('../../../fixtures/objects/accountSearchObject.json')

describe('Account manager API searching for accounts', { tags: "regression" }, function () {
  let testUsers,
    authToken,
    accountsData,
    accountSearchRequestBody

  before(function () {
    cy.fixture('testData').then(data => {
      accountsData = data
    })

    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers

      cy.requestLogIn(
        testUsers.accountManager.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        authToken = loginResponse.body.token
        cy.setLocalStorageLoginInfo(
          loginResponse.body.user,
          loginResponse.body.token
        )
      })
    })
  })

  beforeEach(function () {
    accountSearchRequestBody = JSON.parse(
      JSON.stringify(initAccountSearchRequestBody)
    )
  })

  it('should search the parent account by parent account name', function () {
    accountSearchRequestBody.q = accountsData.parentAccountName

    cy.requestSearchAccountRecords(authToken, accountSearchRequestBody).then(

      accountSearchResult => {
        expect(accountSearchResult.body.hits.hits.length).to.eq(1)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountCode).to.eq(accountsData.parentAccountCode)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountName).to.eq(accountsData.parentAccountName)
      }
    )
  })

  it('should search the parent account by account name', function () {
    accountSearchRequestBody.q = accountsData.accountName

    cy.requestSearchAccountRecords(authToken, accountSearchRequestBody).then(
      accountSearchResult => {
        expect(accountSearchResult.body.hits.hits.length).to.eq(1)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountCode).to.eq(accountsData.parentAccountCode)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountName).to.eq(accountsData.parentAccountName)
      }
    )
  })

  it('should search the parent account by account code', function () {
    accountSearchRequestBody.q = accountsData.parentAccountCode

    cy.requestSearchAccountRecords(authToken, accountSearchRequestBody).then(
      accountSearchResult => {
        expect(accountSearchResult.body.hits.hits.length).greaterThan(0)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountCode).to.eq(accountsData.parentAccountCode)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountName).to.eq(accountsData.parentAccountName)
      }
    )
  })

  it('should search the accounts by Office', function () {
    accountSearchRequestBody.q = accountsData.officeName

    cy.requestSearchAccountRecords(authToken, accountSearchRequestBody).then(
      accountSearchResult => {
        expect(accountSearchResult.body.hits.hits.length).to.eq(1)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountCode).to.eq(accountsData.parentAccountCode)
        expect(accountSearchResult.body.hits.hits[0]._source.parentAccountName).to.eq(accountsData.parentAccountName)
      }
    )
  })

  it('should search the parent account by parent account name using Search Anything method', function () {
    cy.requestQuickSearch(authToken, accountsData.parentAccountName).then(
      searchResults => {
        expect(searchResults.body[0].menuTitle).to.eq(accountsData.parentAccountName)
        expect(searchResults.body[0].indexType).to.eq('parent_account')
      }
    )
  })

  it('should search the account by account name using Search Anything method', function () {
    cy.requestQuickSearch(authToken, accountsData.accountName).then(
      searchResults => {
        expect(searchResults.body[0].menuTitle).to.eq(accountsData.accountName)
        expect(searchResults.body[0].indexType).to.eq('account')
      }
    )
  })

  it('should search the office by office name using Search Anything method', function () {
    cy.requestQuickSearch(authToken, accountsData.officeName).then(searchResults => {
      expect(searchResults.body[0].menuTitle).to.eq(accountsData.officeName)
      expect(searchResults.body[0].indexType).to.eq('office')
    })
  })
})

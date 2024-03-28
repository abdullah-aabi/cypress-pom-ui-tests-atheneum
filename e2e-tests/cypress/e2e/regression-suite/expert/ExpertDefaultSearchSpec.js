import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

describe('Associate searching for experts', { tags: "regression" }, function () {
    let testUsers,
        authToken, localStorage

    const expertSearchPage = new ExpertSearchPage()

    before(function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/login`).as('loginRequest')
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                testUsers.dashboardAccountManager.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
                localStorage = quickLoginResponse.body
                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
            })
        })
    })

    it('should the experts with Active Status by default', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)

        expertSearchPage.searchIconExpertName().click()
        expertSearchRequestBody.expertStatus.activeExpert = true

        cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
            expertSearchResult =>
                expertSearchPage.checkExpertResultsAndTotalField(expertSearchResult)
        )
    })
})

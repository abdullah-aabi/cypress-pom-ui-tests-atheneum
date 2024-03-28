/* eslint-disable no-unused-expressions */
/// <reference types="Cypress" />
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

describe('Adding a PDL Expert by sending compliance reminder', { tags: "regression" }, function () {
    let expertData, expertId, userToken, localStorage
    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()
    const expertDetailsPage = new ExpertDetailsPage()

    before(function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/login`).as('loginRequest')
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testUsers').then(testUsers => {

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                userToken = quickLoginResponse.body.token
                localStorage = quickLoginResponse.body
                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

                //enable PDL expert results
                cy.requestSearchExperts(userToken, expertSearchRequestBody, true)

            })
            cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
            globalPage.getClearSearchButton().click()
        })
        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })
    })

    it('should create a pdl expert by sending the compliance reminder', function () {
        cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert`).as('expertCreateRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-create`).as('eplBulkCreateRequest')

        expertSearchPage.getExpertNameField().type(`${expertData.pdlExperts.allDataExpert.fullName}{enter}`)

        cy.wait('@expertSearchRequest').its('response.statusCode').should('equal', 200)
        expertSearchPage.getExpertResultField().should('have.length', 1)
        expertSearchPage.getExpertResultField().contains(expertData.pdlExperts.allDataExpert.fullName).click()

        expertDetailsPage.selectSendComplianceRequest('German')

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'Compliance in German sent!')

        cy.wait('@expertCreateRequest').its('response').then(expertCreateResponse => {
            expect(expertCreateResponse.statusCode).to.eq(200)

            expertId = expertCreateResponse.body.id

            expertDetailsPage.getExpertName().contains(expertData.pdlExperts.allDataExpert.fullName)
            cy.url().should('eq', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${expertId}`)

            cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)

            globalPage.getClearSearchButton().click()
            expertSearchPage.getExpertNameField().type(`${expertData.pdlExperts.allDataExpert.fullName}{enter}`)
            cy.wait('@expertSearchRequest').its('response.statusCode').should('equal', 200)
            // expertSearchPage.getExpertResultField().should('have.length', 1)
            expertSearchPage.getExpertItemLink().should('have.attr', 'href', `/expert/${expertId}`)

            cy.requestDeleteExpertById(userToken, expertId)
        })
    })
})

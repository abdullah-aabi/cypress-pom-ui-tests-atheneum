/* eslint-disable no-unused-expressions */
/// <reference types="Cypress" />
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import ExpertCreationPage from '../../../pageObjects/ExpertCreationPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

describe('Adding multiple PDL Experts', { tags: "specs_with_issues" }, function () {
    let expertData, testUsers, loginResponseBody

    const expertCount = 3
    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertCreationPage = new ExpertCreationPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.createProjectFromAPI(projectName, 'Expert Sessions')
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {

                loginResponseBody = loginResponse.body
                //enable PDL expert results
                cy.requestSearchExperts(loginResponseBody.token, expertSearchRequestBody, true)
            })
        })

        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })
    })

    beforeEach(() => {
        cy.setLocalStorageLoginInfo(
            loginResponseBody.user,
            loginResponseBody.token
        )
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
        cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert`).as('expertCreateRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-create`).as('eplBulkCreateRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/email-check`).as('emailCheckRequest')

        globalPage.getClearSearchButton().click()

        expertSearchPage.getExpertNameField().type('suman{enter}')

        cy.wait('@expertSearchRequest').its('response.body').then(expertSearch => {
            let increment = 0;

            for (let i = 0; i < expertSearch.hits.hits.length; i++) {
                if (isNaN(expertSearch.hits.hits[i]._id)) {
                    expertSearchPage.getExpertItemLinkById(expertSearch.hits.hits[i]._id).find('input').click()
                    increment += 1
                }
                if (increment === expertCount) break
            }
        })

        expertSearchPage.getExpertsSelectedTotal().should('contain.text', expertCount)

        expertSearchPage.getAddInviteSelectedExperts().click()
        cy.waitForLoadingDisappear()
    })

    it('should discard first expert from pdl experts', function () {
        expertCreationPage.getHeading().should('have.length', expertCount)

        expertCreationPage.getHeading().first().invoke('text').then(expertName => {
            globalPage.getButtonByName('Discard Expert').first().click()

            expertCreationPage.getHeading().first().invoke('text').should('not.equal', expertName)

            expertCreationPage.getHeading().should('have.length', 2)
        })
    })

    it('should discard all experts from pdl experts and close the pop-up', function () {
        expertCreationPage.getHeading().should('have.length', expertCount)

        globalPage.getButtonByName('Discard all').click()

        expertCreationPage.getHeading().should('not.exist')
    })

    it('should discard experts with missing fields only', function () {
        expertCreationPage.getHeading().should('have.length', expertCount)

        // Fill in all Industry Experience (relevance statement)
        expertCreationPage
            .fillIndustryExperiencePDL(expertData.industryExperience)

        // Fill in all Location fields
        // expertCreationPage.selectLocationQuickSelect(expertData.city)

        globalPage.getButtonByName('Discard incomplete experts').click()

        expertCreationPage.getHeading().should('have.length', 0)
    })
})

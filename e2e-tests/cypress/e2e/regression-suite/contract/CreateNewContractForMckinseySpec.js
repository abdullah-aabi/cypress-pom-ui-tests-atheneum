import GlobalPage from '../../../pageObjects/GlobalPage'
import ContractPage from '../../../pageObjects/ContractPage'

describe('Create PAYG contract for Mckinsey', function () {
    let contractTestData, localStorage, testUsers, testData
    const contractPage = new ContractPage()
    const globalPage = new GlobalPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.fixture('testData').then(testdata => {
                testData = testdata

                cy.requestLogIn(
                    testUsers.accountManager.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    localStorage = quickLoginResponse.body
                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                })
            })
        })
        cy.fixture('contractTestData').then(contractData => {
            contractTestData = contractData
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/contract-search`)
        cy.intercept('POST', `**/api/contract`).as('contractCreation')
        cy.intercept('POST', `**/api/contract/search`).as('contractSearch')
        cy.intercept('PUT', `**/api/contract/**`).as('updateContract')
        cy.intercept('POST', `**/api/project/**/pipeline`).as('pipeline')

    })

    it.only('should create/edit/delete PAYG contract type and check standard fee value', function () {
        contractPage.getCreateNewContractBtn().click()
        contractPage.selectParentAccountName(testData.MckinseyParentAccountName)
        contractPage.selectAtheneumContractParty(contractTestData.atheneumContractParty)
        contractPage.selectSignedBy(`${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName}`)
        contractPage.selectContractCoverage('Global')
        contractPage.selectContractTypeForSpecific(contractTestData.contractType)
        contractPage.getSignedCheckbox().check()
        contractPage.selectStartEndDateForPAYG()
        contractPage.priceRangeFromField().should('be.visible').type(contractTestData.pricerangefromPAYG)
        contractPage.priceRangeToField().should('be.visible').type(contractTestData.pricerangetoPAYG)
        contractPage.selectUnlimitedTotalValue().check()
        contractPage.selectCurrency(contractTestData.updatedCurrency)
        globalPage.submitButton().click()

        cy.wait('@contractCreation').its('response.statusCode').should('eq', 200)

        //Edit contract PAYG for specific project
        contractPage.getEditIcon().click()
        cy.pause()

        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' Admin')
        contractPage.priceRangeFromField().should('be.visible').clear().type(contractTestData.updatedPricerangefromPAYG)
        contractPage.priceRangeToField().should('be.visible').clear().type(contractTestData.updatedPricerangetoPAYG)
        contractPage.selectCurrency(contractTestData.updatedCurrency)
        globalPage.submitButton().click()
        cy.wait('@updateContract').its('response.statusCode').should('eq', 200)
        contractPage.getSignedByOnContractPage().should('have.text', testUsers.accountManager.firstName + ' Admin')
        contractPage.getPriceRange().should('include.text', contractTestData.updatedPricerangefromPAYG)
        contractPage.getPriceRange().should('include.text', contractTestData.updatedPricerangetoPAYG)
        contractPage.getPriceRange().should('include.text', contractTestData.updatedCurrency)

        // Delete Contract PAYG for specific project
        contractPage.getDeleteIcon().click()
        contractPage.getDeleteConfirmation().click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', contractTestData.deleteContractMessage)
        cy.wait('@contractSearch').its('response.statusCode').should('eq', 200)
    })
})

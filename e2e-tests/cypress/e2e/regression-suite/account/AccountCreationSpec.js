/// <reference types="Cypress" />
import generator from '../../../support/generator'
import ClientRecordsPage from '../../../pageObjects/ClientRecordsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'

const faker = require("faker");

describe('Create/Delete Account by Admin', { tags: "regression" }, function () {
    let localStorage, clientDetails, authToken, parentAccountId, testUsers

    const globalPage = new GlobalPage()
    const clientRecordsPage = new ClientRecordsPage()
    const companyName = `${faker.company.companyName()} ${faker.company.companySuffix()}`
    const companyCode = `${generator.generateAccountCode()}`
    const updatedCompanyName = `${faker.company.companyName()} ${faker.company.companySuffix()}`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
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
                localStorage = loginResponse.body
                authToken = loginResponse.body.token
                cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-search')
            })
        })
        cy.fixture('clientDetails').then(clientdetails => {
            clientDetails = clientdetails

            cy.fixture('objects/parentAccountCreateObject').then(parentAccountCreateObject => {
                parentAccountCreateObject.parentAccountName = companyName
                parentAccountCreateObject.parentAccountCode = companyCode
                parentAccountCreateObject.operationalGuidelines = clientDetails.operationalGuidelineForParentAccount
                parentAccountCreateObject.disclaimerComment = clientDetails.disclaimerCommentForParentAccount
                cy.requestCreateParentAccount(authToken, parentAccountCreateObject).then(
                    parentAccountCreateResponse => {
                        parentAccountId = parentAccountCreateResponse.body.id
                    })
            })
        })


    })
    beforeEach(function () {
        cy.intercept('GET', '**/api/account/feedbacks/**').as(
            'waitForCreatingAccount')

        cy.intercept('DELETE', '**/api/account/**').as(
            'waitForDeletingClientAccount')

        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('Should create Account for Parent Account', { tags: "smoke" }, function () {
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + `/parent-account/${parentAccountId}`)

        clientRecordsPage.getAddAccountBtn()
            .should('be.visible')
            .click()

        clientRecordsPage.getDisplayNameForParentAccount()
            .should('be.visible')
            .then($name => {
                const parentAccountName = $name.text().trim()
                expect(parentAccountName).to.eq(companyName)
            })

        clientRecordsPage.getCountryField()
            .should('be.visible').type(clientDetails.country)
        clientRecordsPage.selectAsPerText(clientDetails.country)

        clientRecordsPage.getAtheneumCompanyField()
            .should('be.visible').type(clientDetails.atheneumCompany)
        clientRecordsPage.selectAsPerText(clientDetails.atheneumCompany)

        clientRecordsPage.getAtheneumContactField()
            .should('be.visible').type(clientDetails.atheneumContact)
        clientRecordsPage.selectAsPerText(clientDetails.atheneumContact)

        clientRecordsPage.getOperationalGuidelineForAccount()
            .should('be.visible').type(clientDetails.operationalGuidelineForAccount)

        clientRecordsPage.getSaveButton()
            .should('be.visible').click()

        cy.wait('@waitForCreatingAccount')
            .its('response.statusCode').should('eq', 200)

        clientRecordsPage.getNameOnHeading()
            .should('be.visible')
            .then($name => {
                const accountName = $name.text().trim()
                expect(accountName).to.eq(companyName + ' ' + clientDetails.country)
            })

        clientRecordsPage.getCode()
            .should('be.visible')
            .then($name => {
                const accountCode = $name.text().trim()
                expect(accountCode).to.eq(companyCode + ', ' + clientDetails.country)

            })

        clientRecordsPage.getKeyAtheneumContact()
            .should('be.visible')
            .then($name => {
                const keyAtheneumContact = $name.text().trim()
                expect(keyAtheneumContact).to.eq(clientDetails.atheneumContact)
            })

        clientRecordsPage.getAtheneumCompany()
            .should('be.visible')
            .then($name => {
                const atheneumCompany = $name.text().trim()
                expect(atheneumCompany).to.eq(clientDetails.atheneumCompany)
            })

        clientRecordsPage.getOperationalGuideline()
            .then($name => {
                const operationalGuidelineForAccount = $name.text().trim()
                expect(operationalGuidelineForAccount).to.eq(clientDetails.operationalGuidelineForAccount)
            })

        clientRecordsPage.getDisclaimerComment()
            .then($name => {
                const operationalGuidelineForParentAccount = $name.text().trim()
                expect(operationalGuidelineForParentAccount).to.eq(clientDetails.operationalGuidelineForParentAccount)
            })

    })

    it('Should edit Account for Parent Account', function () {
        clientRecordsPage.getAccountEditBtn()
            .should('be.visible').click()

        clientRecordsPage.getAccounNameOnAccountEditPage()
            .should('be.visible')
            .clear()
            .type(updatedCompanyName)

        clientRecordsPage.getCountryField()
            .should('be.visible').clear().type(clientDetails.updatedCountry)
        clientRecordsPage.selectAsPerText(clientDetails.updatedCountry)

        clientRecordsPage.getAtheneumCompanyField()
            .should('be.visible').clear().type(clientDetails.updatedAtheneumCompany)
        clientRecordsPage.selectAsPerText(clientDetails.updatedAtheneumCompany)


        clientRecordsPage.getOperationalGuidelineForAccount()
            .should('be.visible').clear().type(clientDetails.updatedOperationalGuidelineForAccount)

        clientRecordsPage.getExternalComplianceCheckboxForAccount()
            .should('be.visible').check()

        clientRecordsPage.getSaveButton()
            .should('be.visible').click()

        cy.wait('@waitForCreatingAccount')
            .its('response.statusCode').should('eq', 200)

        clientRecordsPage.getNameOnHeading()
            .should('be.visible')
            .then($name => {
                const accountName = $name.text().trim()
                expect(accountName).to.include(updatedCompanyName)
            })

        clientRecordsPage.getCode()
            .should('be.visible')
            .then($name => {
                const accountCode = $name.text().trim()
                expect(accountCode).to.eq(companyCode + ', ' + clientDetails.updatedCountry)

            })


        clientRecordsPage.getAtheneumCompany()
            .should('be.visible')
            .then($name => {
                const atheneumCompany = $name.text().trim()
                expect(atheneumCompany).to.eq(clientDetails.updatedAtheneumCompany)
            })

        clientRecordsPage.getOperationalGuideline()
            .then($name => {
                const operationalGuidelineForAccount = $name.text().trim()
                expect(operationalGuidelineForAccount).to.eq(clientDetails.updatedOperationalGuidelineForAccount)
            })

        clientRecordsPage.getDisclaimerComment()
            .then($name => {
                const operationalGuidelineForParentAccount = $name.text().trim()
                expect(operationalGuidelineForParentAccount).to.eq(clientDetails.operationalGuidelineForParentAccount)
            })

        clientRecordsPage.getExternalComplianceVerification()
            .then($complianceVerification => {
                const complianceVerificationStatus = $complianceVerification.text().trim()
                expect(complianceVerificationStatus).to.eq('Required')
            })

    })

    it('Should delete Account for Parent Account', function () {

        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-search')

        clientRecordsPage.getAccountBtn()
            .should('be.visible').click()

        clientRecordsPage.getSearchClientRecord()
            .should('be.visible').type(updatedCompanyName + '{enter}')

        clientRecordsPage.getSearchResults()
            .should('be.visible')
            .should('have.length', 1)
            .click()

        globalPage.getActionButtonByName('Delete')
            .should('be.visible').click()

        clientRecordsPage.getDeleteConfirmationBtn()
            .should('be.visible').click()

        cy.wait('@waitForDeletingClientAccount')
            .its('response.statusCode').should('eq', 200)

    })

})
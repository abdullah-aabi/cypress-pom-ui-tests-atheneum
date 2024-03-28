/// <reference types="Cypress" />
import generator from '../../../support/generator'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ClientRecordsPage from '../../../pageObjects/ClientRecordsPage'
const faker = require("faker");

describe('Create/Delete Office by Admin', { tags: "regression" }, function () {
    let localStorage, clientDetails, authToken, parentAccountId, accountId, testUsers
    const globalPage = new GlobalPage()
    const clientRecordsPage = new ClientRecordsPage()
    const companyName = `${faker.company.companyName()} ${faker.company.companySuffix()}`
    const companyCode = `${generator.generateAccountCode()}`
    const updatedOfficeName = `${faker.company.companyName()} ${faker.company.companySuffix()}`

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

            cy.requestGetAtheneumContact(authToken).then(
                atheneumContactResponse => {
                    cy.fixture('objects/accountCreateObject').then(accountCreateObject => {
                        accountCreateObject.parentAccountId = parentAccountId
                        accountCreateObject.companyName = companyName + clientDetails.country
                        accountCreateObject.keyContactId = atheneumContactResponse.body[0].id
                        accountCreateObject.operationalGuidelines = clientDetails.operationalGuidelineForAccount
                        cy.requestCreateAccount(authToken, accountCreateObject).then(
                            accountCreateResponse => {
                                accountId = accountCreateResponse.body.id
                            })
                    })
                })
        })
    })

    beforeEach(function () {
        cy.intercept('GET', '**/api/timezone/**').as(
            'waitForGooglePlaces')

        cy.intercept('GET', '**/api/office/feedbacks/**').as(
            'waitForOfficeCreation')

        cy.intercept('DELETE', '**/api/office/**').as(
            'waitForDeletingClientOffice')

        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('Should create Office for Account', { tags: "smoke" }, function () {
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/account/' + accountId)

        clientRecordsPage.getCreateOfficeBtn()
            .should('be.visible').click()

        clientRecordsPage.getCityForOfficeField()
            .should('be.visible').type(clientDetails.cityWithCountry)

        clientRecordsPage.selectAsPerExactText(clientDetails.cityWithCountry)

        cy.wait('@waitForGooglePlaces').its('response.statusCode').should('eq', 200)

        clientRecordsPage.getState()
            .should('be.visible')
            .should('contain', clientDetails.clientCity)

        clientRecordsPage.getCountry()
            .should('be.visible')
            .should('contain', clientDetails.country)

        clientRecordsPage.getTimeZone()
            .should('be.visible')
            .should('contain', clientDetails.timezone)

        clientRecordsPage.getSaveButton()
            .should('be.visible').click()

        cy.wait('@waitForOfficeCreation').its('response.statusCode').should('eq', 200)

        clientRecordsPage.getNameOnHeading()
            .should('be.visible')
            .should('contain', companyName + ' ' + clientDetails.clientCity)

        clientRecordsPage.getCode()
            .should('be.visible')
            .should('contain', companyName)
            .should('contain', companyCode)


        clientRecordsPage.getCityForOffice()
            .should('have.text', clientDetails.clientCity)

        clientRecordsPage.getStateForOffice()
            .should('have.text', clientDetails.clientCity)

        clientRecordsPage.getCountryForOffice()
            .should('have.text', clientDetails.country)

        clientRecordsPage.getTimeZoneForOffice()
            .should('have.text', clientDetails.timezone)
    })

    it('Should edit Office for Account', function () {
        clientRecordsPage.getOfficeEditBtn()
            .should('be.visible').click()

        clientRecordsPage.getOfficeNameOnOfficeEditPage()
            .should('be.visible').clear().type(updatedOfficeName)

        clientRecordsPage.getCityOnOfficeEditPage()
            .should('be.visible').clear().type(clientDetails.updatedcityWithCountry)

        clientRecordsPage.selectAsPerText(clientDetails.updatedcityWithCountry)

        cy.wait('@waitForGooglePlaces').its('response.statusCode').should('eq', 200)


        clientRecordsPage.getState()
            .should('be.visible')
            .should('contain', clientDetails.updatedState)

        clientRecordsPage.getCountry()
            .should('be.visible')
            .should('contain', clientDetails.country)

        clientRecordsPage.getTimeZone()
            .should('be.visible')
            .should('contain', clientDetails.timezone)

        clientRecordsPage.getSaveButton()
            .should('be.visible').click()

        cy.wait('@waitForOfficeCreation').its('response.statusCode').should('eq', 200)

        clientRecordsPage.getNameOnHeading()
            .should('be.visible')
            .should('contain', updatedOfficeName)

        clientRecordsPage.getCode()
            .should('be.visible')
            .should('contain', companyName)
            .should('contain', companyCode)

        clientRecordsPage.getCityForOffice()
            .should('have.text', clientDetails.updatedClientCity)

        clientRecordsPage.getStateForOffice()
            .should('have.text', clientDetails.updatedState)

        clientRecordsPage.getCountryForOffice()
            .should('have.text', clientDetails.country)

        clientRecordsPage.getTimeZoneForOffice()
            .should('have.text', clientDetails.timezone)
    })

    it('Should delete Office for Account', function () {
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-search')

        clientRecordsPage.getOfficeBtn()
            .should('be.visible').click()

        clientRecordsPage.getSearchClientRecord()
            .should('be.visible').type(updatedOfficeName + '{enter}')

        clientRecordsPage.getSearchResults()
            .should('be.visible')
            .should('have.length', 1)
            .click()

        globalPage.getActionButtonByName('Delete')
            .should('be.visible').click()

        clientRecordsPage.getDeleteConfirmationBtn()
            .should('be.visible').click()

        cy.wait('@waitForDeletingClientOffice')
            .its('response.statusCode').should('eq', 200)
    })
})
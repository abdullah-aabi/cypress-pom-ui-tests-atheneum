/// <reference types="Cypress" />
import generator from '../../../support/generator'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ClientRecordsPage from '../../../pageObjects/ClientRecordsPage'
const faker = require("faker");

describe('Creating Client by Admin', { tags: "regression" }, function () {
    let localStorage, clientDetails, authToken, parentAccountId, accountId, officeId, testUsers
    const clientRecordsPage = new ClientRecordsPage()
    const globalPage = new GlobalPage()

    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()
    const updatedFirstName = generator.generateFirstName()
    const updatedLastName = generator.generateLastName()
    const originalName = `${firstName} ${lastName}`
    const updatedOriginalName = `${updatedFirstName} ${updatedLastName}`
    const email = `${firstName + lastName}@mail.com`
    const updatedEmail = `${updatedFirstName + updatedFirstName}@mail.com`
    const companyName = `${faker.company.companyName()} ${faker.company.companySuffix()}`
    const companyCode = `${generator.generateAccountCode()}`
    const clientContactPhoneNo = `${generator.generatePhoneNumber()}`
    const updatedClientContactPhoneNo = `${generator.generatePhoneNumber()}`

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

            cy.fixture('objects/officeCreateObject').then(officeCreateObject => {
                officeCreateObject.parentAccountId = parentAccountId
                officeCreateObject.accountId = accountId
                officeCreateObject.officeName = companyName + clientDetails.clientCity
                officeCreateObject.address.city = clientDetails.clientCity
                officeCreateObject.address.state = clientDetails.clientCity
                cy.requestCreateOffice(authToken, officeCreateObject).then(
                    officeCreateResponse => {
                        officeId = officeCreateResponse.body.id
                    })
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('Should create Client Contact for Office', { tags: "smoke" }, function () {
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + `/office/${officeId}`)

        clientRecordsPage.getAddClientContactBtn()
            .should('be.visible').click()
        clientRecordsPage.getClientContactTitle()
            .should('be.visible').click()
        clientRecordsPage.selectAsPerText(clientDetails.clientContactTitle)
        clientRecordsPage.getClientContactFirstNameField()
            .should('be.visible').type(firstName)
        clientRecordsPage.getClientContactLastNameField()
            .should('be.visible').type(lastName)
        clientRecordsPage.getAutoCompleteOffice()
            .should('have.value', companyName + clientDetails.clientCity)
        clientRecordsPage.getAutoCompleteAccount()
            .should('have.value', companyName + clientDetails.country)
        clientRecordsPage.getPhoneNumberField()
            .should('be.visible').type(clientContactPhoneNo)
        clientRecordsPage.getEmailField()
            .should('be.visible').type(email)
        clientRecordsPage.getSaveButton()
            .should('be.visible').click()
        cy.intercept('GET', '**/api/client/**').as(
            'waitForCreatingClientContact')
        cy.wait('@waitForCreatingClientContact')
        clientRecordsPage.getNameOnHeading()
            .should('be.visible')
            .then($name => {
                const clientContactName = $name.text().trim()
                expect(clientContactName).to.include(originalName)
            })
        clientRecordsPage.getCode()
            .should('be.visible')
            .then($name => {
                const officeCode = $name.text().trim()
                expect(officeCode).to.include(companyName + clientDetails.country + ', ' + clientDetails.country)
            })
        clientRecordsPage.getClientPhoneNumber()
            .should('have.text', clientContactPhoneNo)
        clientRecordsPage.getClientContactEmail()
            .should('have.text', email)
        clientRecordsPage.getClientContactOFfice()
            .should('have.text', companyName + clientDetails.clientCity)
        clientRecordsPage.getClientContactAccount()
            .should('have.text', companyName + clientDetails.country)
        clientRecordsPage.getClientContactCity()
            .should('have.text', clientDetails.clientCity)
        clientRecordsPage.getClientContactState()
            .should('have.text', clientDetails.clientCity)
        clientRecordsPage.getClientContactCountry()
            .should('have.text', clientDetails.country)
        clientRecordsPage.getClientContactTimezone()
            .should('have.text', clientDetails.timezone)
    })

    it('Should edit Client Contact for Office', function () {
        clientRecordsPage.getClientContactEditBtn()
            .should('be.visible').click()

        clientRecordsPage.getClientContactFirstNameField()
            .should('be.visible').clear().type(updatedFirstName)
        clientRecordsPage.getClientContactLastNameField()
            .should('be.visible').clear().type(updatedLastName)

        clientRecordsPage.getPhoneNumberField()
            .should('be.visible').clear().type(updatedClientContactPhoneNo)
        clientRecordsPage.getEmailField()
            .should('be.visible').clear().type(updatedEmail)
        clientRecordsPage.getSaveButton()
            .should('be.visible').click()
        cy.intercept('GET', '**/api/client/**').as(
            'waitForCreatingClientContact')
        cy.wait('@waitForCreatingClientContact')
        clientRecordsPage.getNameOnHeading()
            .should('be.visible')
            .then($name => {
                const clientContactName = $name.text().trim()
                expect(clientContactName).to.include(updatedOriginalName)
            })
        clientRecordsPage.getCode()
            .should('be.visible')
            .then($name => {
                const officeCode = $name.text().trim()
                expect(officeCode).to.include(companyName + clientDetails.country + ', ' + clientDetails.country)
            })
        clientRecordsPage.getClientPhoneNumber()
            .should('have.text', updatedClientContactPhoneNo)
        clientRecordsPage.getClientContactEmail()
            .should('have.text', updatedEmail)
        clientRecordsPage.getClientContactOFfice()
            .should('have.text', companyName + clientDetails.clientCity)
        clientRecordsPage.getClientContactAccount()
            .should('have.text', companyName + clientDetails.country)
        clientRecordsPage.getClientContactCity()
            .should('have.text', clientDetails.clientCity)
        clientRecordsPage.getClientContactState()
            .should('have.text', clientDetails.clientCity)
        clientRecordsPage.getClientContactCountry()
            .should('have.text', clientDetails.country)
        clientRecordsPage.getClientContactTimezone()
            .should('have.text', clientDetails.timezone)

    })
    it('Should delete Client Contact for Office', function () {
        globalPage.getActionButtonByName('Delete')
            .should('be.visible').click()
        cy.intercept('DELETE', '**/api/client/**').as(
            'waitForDeletingClientContact')
        clientRecordsPage.getDeleteConfirmationBtn()
            .should('be.visible').click()
        cy.wait('@waitForDeletingClientContact')
            .its('response.statusCode').should('eq', 200)
    })
})
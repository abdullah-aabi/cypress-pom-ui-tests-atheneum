/// <reference types="Cypress" />
import generator from '../../../support/generator'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ClientRecordsPage from '../../../pageObjects/ClientRecordsPage'
const faker = require("faker");

describe('Create/Delete Parent Account by Admin', { tags: "regression" }, function () {
    let localStorage, clientDetails, testUsers
    const globalPage = new GlobalPage()
    const clientRecordsPage = new ClientRecordsPage()
    const companyName = `${faker.company.companyName()} ${faker.company.companySuffix()}`
    const companyCode = `${generator.generateAccountCode()}`
    const companyNameUpdated = `${faker.company.companyName()} ${faker.company.companySuffix()}`
    const companyCodeUpdated = `${generator.generateAccountCode()}`

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
                cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-search')
            })
        })
        cy.fixture('clientDetails').then(clientdetails => {
            clientDetails = clientdetails
        })

    })
    beforeEach(function () {
        cy.intercept('DELETE', '**/api/parent-account/**').as(
            'waitForDeletingClientParentAccount')
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('Should create Parent Account for client records', { tags: "smoke" }, function () {
        clientRecordsPage.getCreateParentAccountBtn()
            .should('be.visible').click()

        clientRecordsPage.getPArentAccountNameField()
            .should('be.visible').type(companyName)

        clientRecordsPage.getParentAccountCodeField()
            .should('be.visible').type(companyCode)

        clientRecordsPage.getParentAccountTypeDropdown()
            .should('be.visible').click()

        clientRecordsPage.selectAsPerText(clientDetails.parentAccountType)

        clientRecordsPage.getOperationalGuidelineForParentAccountField()
            .should('be.visible').type(clientDetails.operationalGuidelineForParentAccount)

        clientRecordsPage.getDisclaimerCommentForParentAccountField()
            .should('be.visible').type(clientDetails.disclaimerCommentForParentAccount)

        clientRecordsPage.getShowSubmittedExpertCheckboxOnParentAccount()
            .should('be.visible')
            .check()

        clientRecordsPage.getSaveButton()
            .should('be.visible').click()

        clientRecordsPage.getNameOnHeading()
            .should('have.text', companyName)

        clientRecordsPage.getCode()
            .should('have.text', companyCode)

        clientRecordsPage.getOperationalGuideline()
            .should('have.text', clientDetails.operationalGuidelineForParentAccount)

        clientRecordsPage.getDisclaimerComment()
            .should('have.text', clientDetails.disclaimerCommentForParentAccount)

        clientRecordsPage.getParentAccountType()
            .should('have.text', clientDetails.parentAccountType)

        clientRecordsPage.getParentAccountInvoicingCoverage()
            .should('have.text', 'None')

        clientRecordsPage.getParentAccountCaseCode()
            .should('have.text', 'Required')

        clientRecordsPage.getShowSubmittedExpertOnParentAccount()
            .should('have.text', 'Yes')
    })
    it('Should edit Parent Account for client records', function () {
        clientRecordsPage.getParentAccountEditBtn()
            .should('be.visible').click()

        clientRecordsPage.getPArentAccountNameField()
            .should('be.visible').clear().type(companyNameUpdated)

        clientRecordsPage.getParentAccountCodeField()
            .should('be.visible').clear().type(companyCodeUpdated)

        clientRecordsPage.getParentAccountTypeDropdown()
            .should('be.visible').click()

        clientRecordsPage.selectAsPerText(clientDetails.updatedParentAccountType)

        clientRecordsPage.selectInvoicingCoverageForParentAccount()
            .should('be.visible').click()

        clientRecordsPage.getOperationalGuidelineForParentAccountField()
            .should('be.visible').clear().type(clientDetails.updatedOperationalGuidelineForParentAccount)

        clientRecordsPage.getDisclaimerCommentForParentAccountField()
            .should('be.visible').clear().type(clientDetails.updatedDisclaimerCommentForParentAccount)

        clientRecordsPage.getCaseCodeRequiredCheckboxOnParentAccount()
            .should('be.visible')
            .uncheck()

        clientRecordsPage.getShowSubmittedExpertCheckboxOnParentAccount()
            .should('be.visible')
            .uncheck()

        clientRecordsPage.getSaveButton()
            .should('be.visible').click()

        clientRecordsPage.getNameOnHeading()
            .should('have.text', companyNameUpdated)

        clientRecordsPage.getCode()
            .should('have.text', companyCodeUpdated)

        clientRecordsPage.getOperationalGuideline()
            .should('have.text', clientDetails.updatedOperationalGuidelineForParentAccount)

        clientRecordsPage.getDisclaimerComment()
            .should('have.text', clientDetails.updatedDisclaimerCommentForParentAccount)

        clientRecordsPage.getParentAccountType()
            .should('have.text', clientDetails.updatedParentAccountType)


        clientRecordsPage.getParentAccountInvoicingCoverage()
            .should('have.text', 'Account specific')

        clientRecordsPage.getParentAccountCaseCode()
            .should('have.text', 'Not required')

        clientRecordsPage.getShowSubmittedExpertOnParentAccount()
            .should('have.text', 'No')
    })

    it('Should delete Parent Account for client records', function () {
        globalPage.getActionButtonByName('Delete')
            .should('be.visible').click()

        clientRecordsPage.getDeleteConfirmationBtn()
            .should('be.visible').click()

        cy.wait('@waitForDeletingClientParentAccount')
            .its('response.statusCode').should('eq', 200)

    })
})
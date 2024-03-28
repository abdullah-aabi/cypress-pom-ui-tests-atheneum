import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import { address, finance, company } from 'faker'

describe('Expert Payment Details Tests', { tags: "regression" }, function () {
    let expertData, testUsers, authToken, localStorage
    let expertNamesData = []

    const globalPage = new GlobalPage()
    const expertsAppPage = new ExpertsAppPage()

    const testData = {
        address: address.streetAddress(),
        zipCode: address.zipCode(),
        accountName: finance.accountName(),
        companyName: company.companyName(),
        city: address.city(),
        country: "Poland",
        vatNumber: 'DE123456',
        vatClass: '19%',
        iban: finance.bitcoinAddress(),
        swift: "SWIFT1122",
        bankName: company.companyName(),
        bankAddress: address.streetAddress(),
        bankZipCode: address.zipCode(),
        bankCity: address.city(),
        bankCountry: 'Romania',
        comment: "Please pay at the beginning of each month!"
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        const firstName = generator.generateFirstName()
        const lastName = generator.generateLastName()

        expertNamesData = {
            firstName: firstName,
            lastName: lastName,
            originalName: `${firstName} ${lastName}`,
            email: `${firstName + lastName}@mail.com`
        }

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
            })
        })

        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })

        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = expertNamesData.firstName
            expertCreateObject.lastName = expertNamesData.lastName
            expertCreateObject.originalName = expertNamesData.originalName
            expertCreateObject.email = expertNamesData.email
            cy.requestCreateExpert(authToken, expertCreateObject).then(
                expertCreateResponse =>
                    cy.requestLoginAsExpertById(expertCreateResponse.body.id).then(
                        expertQuickLoginResponse => {
                            cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
                            localStorage = expertQuickLoginResponse.body
                            cy.setLocalStorageLoginInfo(null, localStorage.token, "expert")
                        }
                    )
            )
        })
    })

    beforeEach(function () {
        // cy.setLocalStorageLoginInfo(null, localStorage.token, "expert")
        cy.visit(`${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/auth/quick-login?token=${localStorage.token}&location=/payment-details`)
    })

    it('should add new payment details', function () {
        expertsAppPage.getComplianceButton('Confirm').click()

        expertsAppPage.getComplianceHeader().should('not.exist')
        globalPage.getNotificationTitle().should('have.text', 'Welcome to Atheneum!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'Thank you for signing the Expert Agreement.')

        expertsAppPage
            .getAddPaymentDetails()
            .click()

        expertsAppPage.selectPaymentDetailsServiceType('Private')

        expertsAppPage
            .getPaymentDetailsAddress()
            .type(testData.address)

        expertsAppPage
            .getPaymentDetailsPostalCode()
            .type(testData.zipCode)

        expertsAppPage
            .getPaymentDetailsAccountOwner()
            .type(testData.accountName)

        expertsAppPage
            .getPaymentDetailsAccountNumber()
            .type(testData.iban)

        expertsAppPage
            .getPaymentDetailsBankCode()
            .type(testData.swift)

        expertsAppPage
            .getPaymentDetailsBankName()
            .type(testData.bankName)

        expertsAppPage
            .selectPaymentDetailsBankCountry(testData.bankCountry)

        expertsAppPage.getPaymentDetailsSaveButton().click()

        expertsAppPage
            .getPaymentDetailsPopupMessage()
            .should('have.text', expertData.paymentDetailsConfirmMessage)

        expertsAppPage.getComplianceDeclineConfirmButton().click()

        expertsAppPage.getPaymentDetailsStatus().should('have.text', 'Confirmed')

        globalPage
            .getNotificationMessage().should('have.text', expertData.paymentDetailsNotification)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Payment service type")
            .should('have.text', 'Private')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Invoice needed")
            .should('have.text', 'No')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Address")
            .should('have.text', testData.address)

        expertsAppPage
            .getPaymentDetailsValueByLabel("City")
            .should('have.text', 'Berlin')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Postal code")
            .should('have.text', testData.zipCode)

        expertsAppPage
            .getPaymentDetailsValueByLabel("State")
            .should('have.text', 'Berlin')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Country")
            .should('have.text', 'Germany')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Payment transfer method")
            .should('have.text', 'Direct transfer')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Account owner")
            .should('have.text', testData.accountName)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Account number")
            .should('contain.text', (testData.iban).substring(0, 3))

        expertsAppPage
            .getPaymentDetailsValueByLabel("SWIFT")
            .should('have.text', testData.swift)


        expertsAppPage
            .getPaymentDetailsValueByLabel("Bank name")
            .should('have.text', testData.bankName)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Bank country")
            .should('have.text', testData.bankCountry)
    })

    it('should edit the existing payment details', function () {
        expertsAppPage
            .getPaymentDetailsEdit().click()

        expertsAppPage.selectPaymentDetailsServiceType('Business')
        expertsAppPage.getPaymentDetailsInvoiceNeeded().contains('Yes').click()

        expertsAppPage
            .getPaymentDetailsCompanyName()
            .type(testData.companyName)

        expertsAppPage
            .getPaymentDetailsVATNumber()
            .type(testData.vatNumber)

        expertsAppPage.selectPaymentDetailsVATClass(testData.vatClass)

        expertsAppPage.getPaymentDetailsCity().clear().type(testData.city)
        expertsAppPage.selectPaymentDetailsCountry(testData.country)

        expertsAppPage.getPaymentDetailsBankAddress().type(testData.bankAddress)
        expertsAppPage.getPaymentDetailsBankCity().type(testData.bankCity)
        expertsAppPage.getPaymentDetailsBankPostalCode().type(testData.bankZipCode)
        expertsAppPage.getPaymentDetailsBankState().type(testData.bankCity)

        expertsAppPage.getPaymentDetailsBankComment().type(testData.comment)

        expertsAppPage.getPaymentDetailsSaveButton().click()

        expertsAppPage.getComplianceDeclineConfirmButton().click()

        expertsAppPage.getPaymentDetailsStatus().should('have.text', 'Confirmed')

        globalPage
            .getNotificationMessage().should('have.text', expertData.paymentDetailsNotification)

        expertsAppPage
            .getPaymentDetailsValueByLabel("City")
            .should('have.text', testData.city)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Country")
            .should('have.text', testData.country)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Invoice needed")
            .should('have.text', 'Yes')

        expertsAppPage
            .getPaymentDetailsValueByLabel("Company name")
            .should('have.text', testData.companyName)

        expertsAppPage
            .getPaymentDetailsValueByLabel("VAT number")
            .should('have.text', testData.vatNumber)

        expertsAppPage
            .getPaymentDetailsValueByLabel("VAT class")
            .should('have.text', testData.vatClass)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Bank street address")
            .should('have.text', testData.bankAddress)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Bank city")
            .should('have.text', testData.bankCity)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Bank zip code")
            .should('have.text', testData.bankZipCode)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Bank state")
            .should('have.text', testData.bankCity)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Comments")
            .should('have.text', testData.comment)

        expertsAppPage.getSignOutBtn().click()
        cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
    })
})

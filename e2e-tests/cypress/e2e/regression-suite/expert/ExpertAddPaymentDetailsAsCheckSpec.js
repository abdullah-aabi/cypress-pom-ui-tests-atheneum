import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import { address, finance, company } from 'faker'

describe('Expert Payment Details Tests', { tags: "regression" }, function () {
    let expertData, testUsers, authToken, localStorage, expertId, localStorageAssociate
    let expertNamesData = []

    const globalPage = new GlobalPage()
    const expertsAppPage = new ExpertsAppPage()

    const testData = {
        address: address.streetAddress(),
        zipCode: "61259",
        accountName: finance.accountName(),
        companyName: company.companyName(),
        city: "New York City",
        state: "New York",
        bankCity: "New York",
        country: "United States",
        comment: "Please pay at the beginning of each month!",
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
                localStorageAssociate = quickLoginResponse.body
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
            expertCreateObject.address.city = testData.city
            expertCreateObject.address.countryId = 219
            expertCreateObject.address.state = testData.state
            expertCreateObject.address.timezoneId = 381
            expertCreateObject.address.postalCode = testData.zipCode
            cy.requestCreateExpert(authToken, expertCreateObject).then(
                expertCreateResponse =>
                    cy.requestLoginAsExpertById(expertCreateResponse.body.id).then(
                        expertQuickLoginResponse => {
                            cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
                            localStorage = expertQuickLoginResponse.body
                            cy.setLocalStorageLoginInfo(null, localStorage.token, "expert")

                            expertId = expertCreateResponse.body.id
                        }
                    )
            )
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.visit(`${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/auth/quick-login?token=${localStorage.token}&location=/payment-details`)
    })

    it('should add new payment details as check with same address', function () {
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
        expertsAppPage.selectPaymentCountry(testData.country)

        //Select payment menthod as check , this payment menthod is only for experts from Unites states
        expertsAppPage.selectPaymentDetailsTransferMethod('Check')
        expertsAppPage.getCopyExistingAddressBtn().click()
        expertsAppPage.getCheckAddress().should('have.value', testData.address)
        expertsAppPage.getCheckCity().should('have.value', testData.city)
        expertsAppPage.getCheckPostalCode().should('have.value', testData.zipCode)
        expertsAppPage.getCheckState().should('have.value', testData.state)

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
            .should('have.text', testData.city)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Postal code")
            .should('have.text', testData.zipCode)

        expertsAppPage
            .getPaymentDetailsValueByLabel("State")
            .should('have.text', testData.state)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Country")
            .should('have.text', testData.country)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Payment transfer method")
            .should('have.text', 'Check')
        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${expertId}/payment-details`)

        expertsAppPage
            .getPaymentDetailsValue("Payment service type")
            .should('have.text', 'Private')

        expertsAppPage
            .getPaymentDetailsValue("Invoice needed")
            .should('have.text', 'No')

        expertsAppPage
            .getPaymentDetailsValue("Address")
            .should('have.text', testData.address)

        expertsAppPage
            .getPaymentDetailsValue("City")
            .should('have.text', testData.city)

        expertsAppPage
            .getPaymentDetailsValue("Postal code")
            .should('have.text', testData.zipCode)

        expertsAppPage
            .getPaymentDetailsValue("State")
            .should('have.text', testData.state)

        expertsAppPage
            .getPaymentDetailsValue("Country")
            .should('have.text', testData.country)

        expertsAppPage
            .getPaymentDetailsValue("Payment transfer method")
            .should('have.text', 'Check')

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

        expertsAppPage.getPaymentDetailsCity().clear().type(testData.city)
        expertsAppPage.selectPaymentCountry(testData.country)

        expertsAppPage.getPaymentDetailsCheckAddress().clear().type(testData.bankAddress)
        expertsAppPage.getPaymentDetailsCheckCity().clear().type(testData.bankCity)
        expertsAppPage.getPaymentDetailsCheckPostalCode().clear().type(testData.bankZipCode)
        expertsAppPage.getPaymentDetailsCheckState().clear().type(testData.bankCity)

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
            .getPaymentDetailsValueByLabel("Street address")
            .should('have.text', testData.bankAddress)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Zip code")
            .should('have.text', testData.bankZipCode)

        expertsAppPage
            .getPaymentDetailsValueByLabel("Comments")
            .should('have.text', testData.comment)


        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${expertId}/payment-details`)

        expertsAppPage
            .getPaymentDetailsValue("City")
            .should('have.text', testData.city)

        expertsAppPage
            .getPaymentDetailsValue("Country")
            .should('have.text', testData.country)

        expertsAppPage
            .getPaymentDetailsValue("Invoice needed")
            .should('have.text', 'Yes')

        expertsAppPage
            .getPaymentDetailsValue("Company name")
            .should('have.text', testData.companyName)

        expertsAppPage
            .getPaymentDetailsValue("VAT number")
            .should('have.text', testData.vatNumber)

        expertsAppPage
            .getPaymentDetailsValue("Street address")
            .should('have.text', testData.bankAddress)

        expertsAppPage
            .getPaymentDetailsValue("Zip code")
            .should('have.text', testData.bankZipCode)

        expertsAppPage
            .getPaymentDetailsValue("Comments")
            .should('have.text', testData.comment)
    })
})

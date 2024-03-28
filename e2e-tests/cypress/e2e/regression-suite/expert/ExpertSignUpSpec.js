import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import generator from '../../../support/generator'

describe('Expert Sign Up flow', { tags: "regression" }, function () {
    let expertDetails
    const expertsAppPage = new ExpertsAppPage()
    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()

    const expertInfo = {
        firstName: firstName,
        lastName: lastName,
        email: `${firstName + lastName}@mail.com`
    }

    before(function () {
        cy.intercept('POST', `${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/api/expert/register`).as('expertRegisterRequest')
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL'))
        cy.clearLocalAndSessionStorage()
        cy.fixture('expertDetails').then(expertdetails => {
            expertDetails = expertdetails
        })
    })

    it('should not allow the user to login with invalid credentials', function () {
        expertsAppPage.getButtonByName('SIGN UP').click()

        expertsAppPage.selectTitle('Mr.')
        expertsAppPage.getFirstName().type(expertInfo.firstName)
        expertsAppPage.getLastName().type(expertInfo.lastName)
        expertsAppPage.getExpertComplianceEmailAddress().type(expertInfo.email)
        expertsAppPage.getLoginPasswordInput().type(expertDetails.resetPasswordToken)
        expertsAppPage.getPasswordRepeat().type(expertDetails.resetPasswordToken)

        expertsAppPage.getButtonByName('SIGN UP').click()
        cy.wait('@expertRegisterRequest')
        expertsAppPage.getLabelBlack().should('have.text', expertDetails.expertRegisteredThankYou)
    })

    it('should not allow the user to login with unconfirmed email address', function () {
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL'))

        expertsAppPage.getLoginEmailInput().type(expertInfo.email)

        expertsAppPage.getLoginPasswordInput().type(expertDetails.resetPasswordToken)
        expertsAppPage.getButtonByName('LOG IN').click()

        expertsAppPage.getLoginErrorMessage().should('have.text', expertDetails.emailUnconfirmed)
    })

})

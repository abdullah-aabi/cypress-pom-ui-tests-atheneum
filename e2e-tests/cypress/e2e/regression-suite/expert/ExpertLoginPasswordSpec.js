import LoginPage from '../../../pageObjects/LoginPage'
import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'

describe('Expert Forget Password and Password reset flow', { tags: "regression" }, function () {
    let expertDetails
    const loginPage = new LoginPage()
    const expertsAppPage = new ExpertsAppPage()

    before(function () {
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL'))
        cy.clearLocalAndSessionStorage()
        cy.fixture('expertDetails').then(expertdetails => {
            expertDetails = expertdetails
        })
    })

    it('should not allow the user to login with invalid credentials', function () {
        expertsAppPage.getLoginEmailInput().type(expertDetails.resetUserEmail)

        expertsAppPage.getLoginPasswordInput().type(expertDetails.resetUserEmail)
        expertsAppPage.getButtonByName('LOG IN').click()

        expertsAppPage.getLoginErrorMessage().should('have.text', expertDetails.userLoginInvalidCredentials)
    })

    it('should show an email sent with the password token even if user does not exist', function () {
        expertsAppPage.getForgotPasswordLink().click()
        loginPage.getForgotPasswordEmailField().type('test@gmail.com')
        loginPage.getSubmitButton().click()
        loginPage.getResetPasswordMessage().should('have.text', expertDetails.passwordTokenEmailSent)
    })


    it('should send an email with the password token if user has forgot the password', function () {
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL'))
        expertsAppPage.getForgotPasswordLink().click()
        loginPage.getForgotPasswordEmailField().clear().type(expertDetails.resetUserEmail)
        loginPage.getSubmitButton().click()

        loginPage.getResetPasswordMessage().should('have.text', expertDetails.passwordTokenEmailSent)
    })

    it.skip('should get the password reset link and reset user password', function () {
        cy.visit(`${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/auth/reset-password/${expertDetails.resetPasswordToken}`)

        loginPage.getPasswordResetPasswordInput().type(expertDetails.resetPasswordToken)
        loginPage.getPasswordResetRepeatPasswordInput().type(expertDetails.resetPasswordToken)
        loginPage.getSubmitButton().click()

        loginPage.getResetPasswordMessage().should('have.text', expertDetails.passwordResetSuccessful)
    })

    it.skip('should allow the user to login with the new password', function () {
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL'))
        expertsAppPage.getLoginEmailInput().type(expertDetails.resetUserEmailHardcoded)

        expertsAppPage.getLoginPasswordInput().type(expertDetails.resetPasswordToken)
        expertsAppPage.getButtonByName('LOG IN').click()

        expertsAppPage.getWelcomeMessage().should('be.visible')
    })
})

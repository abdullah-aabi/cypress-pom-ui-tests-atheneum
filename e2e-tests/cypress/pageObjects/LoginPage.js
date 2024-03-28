class LoginPage {
  getLoginUsernameInput() {
    return cy.get('input[type="email"]')
      .should('be.visible')
  }

  getLoginPasswordInput() {
    return cy.get('input[type=password]')
      .should('be.visible')
  }

  getLoginErrorMessage() {
    return cy.get('div.info-box-wrapper__rows').should('be.visible')
  }

  getForgotPasswordLink() {
    return cy.get('[data-cy="forgot-password"]').should('be.visible')
  }

  getForgotPasswordEmailField() {
    return cy.get('input.expert-form__input').should('be.visible')
  }

  getSubmitButton() {
    return cy.get('.expert-form-login__input-group button').should('be.visible')
  }

  getResetPasswordMessage() {
    return cy.get('.expert-form__label--black').should('be.visible')
  }

  getPasswordResetPasswordInput() {
    return cy.get('input[name="password"]').should('be.visible')
  }

  getPasswordResetRepeatPasswordInput() {
    return cy.get('input[name="passwordRepeat"]').should('be.visible')
  }

  getOfficeLoginBtn() {
    return cy.get('input[value="Office365"]').first()
  }

  getSubmitBtn() {
    return cy.get('input[type="submit"]')
  }
}

export default LoginPage

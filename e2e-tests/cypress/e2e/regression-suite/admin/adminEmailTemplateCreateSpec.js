import EmailTemplatesPage from '../../../pageObjects/EmailTemplatesPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'

describe('Admin creating new email templates', { tags: ["regression", "smoke"] }, function () {
    let emailData, authToken
    const emailTemplatesPage = new EmailTemplatesPage()
    const globalPage = new GlobalPage()

    const templateName = `Template_${generator.generateTestName()}`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.requestLogIn(
            Cypress.env('CYPRESS_ADMIN_USERNAME'),
            Cypress.env('CYPRESS_ADMIN_PASSWORD')
        ).then(loginResponse => {
            authToken = loginResponse.body
            cy.fixture('emailTemplatesData').then(data => {
                emailData = data
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(
            authToken.user,
            authToken.token
        )
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/admin/email-templates`)
    })

    it('create new email template', function () {
        emailTemplatesPage.getCreateTemplateButton().click()
        emailTemplatesPage.getTemplateNameInput().type(templateName)
        emailTemplatesPage.getTemplateGroupInput().select('EPL_extract')
        emailTemplatesPage.getTemplateSubjectInput().type(emailData.subject, { parseSpecialCharSequences: false })
        emailTemplatesPage.getTemplateContentInput().type(emailData.content, { parseSpecialCharSequences: false })
        emailTemplatesPage.getTemplateSaveButton().click()

        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'Template was successfully saved')

        emailTemplatesPage.getFilterInput().type(templateName)
        emailTemplatesPage.getEmailTemplates().should('have.length', 1).should('have.text', templateName).click()
        emailTemplatesPage.getEmailTemplateGroup().should('have.text', 'EPL_extract')

        emailTemplatesPage.getTemplateNameInput().should('have.attr', 'value', templateName)
        emailTemplatesPage.getTemplateSubjectInput().should('have.attr', 'value', emailData.subject)
        emailTemplatesPage.getTemplateContentInput().should('have.text', emailData.content)
    })

    it('edit created email template', function () {
        emailTemplatesPage.getFilterInput().type(templateName)
        emailTemplatesPage.getEmailTemplates().should('have.length', 1).should('have.text', templateName).click()
        emailTemplatesPage.getTemplateSubjectInput().clear().type('Test subject')
        emailTemplatesPage.getTemplateSaveButton().click()

        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'Template was successfully saved')
    })
})

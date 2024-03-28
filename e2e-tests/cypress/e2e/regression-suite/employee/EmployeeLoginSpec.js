// WIP
describe('Employee Login Tests', { tags: "specs_with_issues" }, function () {

    before(function () {
        // cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL'))
        // cy.clearLocalAndSessionStorage()
    })
})

function loginWithSession(email, password) {
    const args = { email, password }
    cy.session(args, () => {
        cy.log('args ' + JSON.stringify(args))
        // cy.visit('https://platform.integration.atheneum-dev.com')
        // cy.get('button.button--primary').click()

        cy.request({ url: 'https://auth.integration.atheneum-dev.com/login?ru=https://platform.integration.atheneum-dev.com/', method: 'GET', followRedirect: false }).then(response => {
            cy.visit(response.redirectedToUrl)
            cy.get('input[value="Office365"]').first().should("exist").click({ force: true })

            cy.origin('https://login.microsoftonline.com/', { args }, ({ email, password }) => {
                cy.log('args ' + { email, password })
                cy.get('input[type="email"]').type(email)
                cy.get('input[type="submit"]').click()
                cy.get('input[type="password"]').type(password)
                cy.get('input[type="submit"]').click()
                cy.get('input[type="submit"]').click()
            }
            )
        })

        // cy.origin('https://aws-auth.atheneum-app.com/login', { args }, ({ email, password }) => {

        //     const args = { email, password }

        //     cy.log('args ' + JSON.stringify(args))
        //     cy.get('input[value="Office365"]').first().should("exist").click({ force: true })

        //     // cy.origin('https://login.microsoftonline.com/', { args }, ({ email, password }) => {
        //     //     cy.log('args ' + { email, password })
        //     //     cy.get('input[type="email"]').type(email)
        //     //     cy.get('input[type="submit"]').click()
        //     //     cy.get('input[type="password"]').type(password)
        //     //     cy.get('input[type="submit"]').click()
        //     //     cy.get('input[type="submit"]').click()
        //     // }
        //     // )
        // })

    })
}

it.skip('should allow the user to login with 2FA', function () {
    loginWithSession('test.migration1@atheneum.ai', '@theneumTEST1')
})

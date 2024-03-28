import generator from '../../../support/generator'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import GetLinksPage from '../../../pageObjects/GetLinksPage'
import ClientLoginAsPage from '../../../pageObjects/ClientLoginAsPage'


describe('Updating client authentication setting on project level', { tags: "regression" }, function () {
    let testUsers,
        projectId,
        localStorage,
        clientPersonalizedLink,
        clientGenericLink,
        testdata,
        clientauthorizeDetail

    let expertData = generator.generateExpertNames(1)[0]
    let clientFirstName = generator.generateFirstName()
    let clientLastName = generator.generateLastName()

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const projectDetailsPage = new ProjectDetailsPage()
    const expertInvitePage = new ExpertInvitePage()
    const globalPage = new GlobalPage()
    const getLinksPage = new GetLinksPage()
    const clientLoginAsPage = new ClientLoginAsPage()
    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testData').then(testData => {
            testdata = testData
        })
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
        })

        cy.fixture('clientAuthorizeDetail').then(clientAuthorizeDetail => {
            clientauthorizeDetail = clientAuthorizeDetail
        })

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                cy.requestLogIn(
                    testUsers.accountManager.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    localStorage = quickLoginResponse.body
                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

                    cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                        expertCreateObject.firstName = expertData.firstName
                        expertCreateObject.lastName = expertData.lastName
                        expertCreateObject.originalName = expertData.originalName
                        expertCreateObject.email = expertData.email
                        cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                            expertCreateResponse => {
                                cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
                            }
                        )
                    })
                    cy.visit(
                        `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                    )
                })
            }
        )
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('PUT', '**/api/settings/main/project/**').as('waitForUpdatingSetting')
        cy.intercept('POST', '**/api/project/**/extern-links/**').as('waitForExternalLinks')
        cy.intercept('POST', '**/api/quick-login').as('waitForQuickLogin')
        cy.intercept('GET', '**/api/project/**/client-feedback').as('waitForClientFeedback')   
    })

    // Switch on client Auth on Project levels
    it('Should switch On client authentication setting on project level', function () {
        projectDetailsPage.getEditProjectSettingBtn().should('be.visible').click()
        projectDetailsPage.getClientAuthenticationOption().should('be.visible').click()
        projectDetailsPage.submitButton().click()
        cy.wait('@waitForUpdatingSetting').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForClientFeedback').its('response.statusCode').should('eq', 200)   
    })

    // Get personalized client links
    it('Should Verfiy Personalized links', function () {
        cy.waitForLoadingDisappear()
        expertInvitePage.getExpertsPipelineButton().click()
        globalPage.getActionButtonByName('Get link').click()
        projectDetailsPage.getExpandIconforClientLink().click()
        projectDetailsPage.getLinkText().then($linkText => {
            clientPersonalizedLink = $linkText.text()
            cy.visit(clientPersonalizedLink)
            cy.wait('@waitForQuickLogin').its('response.statusCode').should('eq', 200)
        })
        getLinksPage.getClientName().should('have.text', testdata.clientContactName)
    })

    // Get generic client link
    it('Should Verfiy Generic link', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        globalPage.getActionButtonByName('Get link').click()
        projectDetailsPage.gerGenericClientLink().click()
        projectDetailsPage.getLinkText().then($linkText => {
            clientGenericLink = $linkText.text()
            cy.visit(clientGenericLink)
            cy.wait('@waitForQuickLogin').its('response.statusCode').should('eq', 200)
        })
        clientLoginAsPage.getLoginAsTitle().should('have.text', 'Log in as:')
    })

    it('Should Select exisitng client contact from generic link', function () {
        clientLoginAsPage.chooseExistingUser().click()
        clientLoginAsPage.getSubmitBtn().click()
        cy.wait('@waitForQuickLogin').its('response.statusCode').should('eq', 200)
        clientLoginAsPage.getLoginAs().should('contain.text', 'You are logged in as')
        clientLoginAsPage.getLoginAs().should('contain.text', `${testdata.clientContactName}`)
    })

    // Fail Authorization for newly registered client contact
    it('Should fail authorization for newly added client contact with different domain', function () {
        cy.visit(clientGenericLink)
        clientLoginAsPage.newUserBtn().click()
        clientLoginAsPage.getFirstName().type(clientFirstName)
        clientLoginAsPage.getLastName().type(clientLastName)
        clientLoginAsPage.getEmail().type(clientFirstName + clientLastName + `@gmail.com`)
        clientLoginAsPage.getAuthorizeBtn().click()
        clientLoginAsPage.getAuthorizeErrorHeading().should('have.text', clientauthorizeDetail.invalidEmailHeading)
        clientLoginAsPage.getAuthorizeErrorMessage().first().should('have.text', clientauthorizeDetail.invalidEmailMessage)
        clientLoginAsPage.getAtheneumContactName().should('have.text', testUsers.accountManager.firstName + ' ' + testUsers.accountManager.lastName)
        clientLoginAsPage.getAtheneumContactEmail().should('contain.text', testUsers.accountManager.emailAddress)
    })

})



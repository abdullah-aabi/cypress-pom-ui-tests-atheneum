import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import generator from '../../../support/generator'
const downloadsFolder = Cypress.config("downloadsFolder");
const path = require("path");


describe('Admin Expert Compliance', { tags: "regression" }, function () {
    let testUsers, authToken, localStorage, policyValue, noticeValue
    let createdExperts = []
    let expertsData = generator.generateExpertNames(1)[0]
    const expertsAppPage = new ExpertsAppPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                Cypress.env('CYPRESS_ADMIN_USERNAME'),
                Cypress.env('CYPRESS_ADMIN_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
                localStorage = loginResponse.body

                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
            })
        })
        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = expertsData.firstName
            expertCreateObject.lastName = expertsData.lastName
            expertCreateObject.originalName = expertsData.originalName
            expertCreateObject.email = expertsData.email
            cy.requestCreateExpert(authToken, expertCreateObject).then(
                expertCreateResponse =>
                    createdExperts.push({
                        expertId: expertCreateResponse.body.id,
                        fullName: expertCreateObject.originalName
                    })
            )
        })
    })

    beforeEach(function () {
        cy.intercept('GET', `${Cypress.env('SHERLOCK_URL')}/api/comment?expertId=*`).as('getExpert')
    })

    it('should verify privacy policy using login as functionality', function () {

        const expID = createdExperts[0].expertId
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${expID}`)
        cy.wait('@getExpert')
        expertsAppPage.getLoginAs().click()
        expertsAppPage.getQuickLoginLink().click()
        expertsAppPage.getPrivacyPolicy().should('be.visible')
        expertsAppPage.getPrivacyPolicyNotice().should('be.visible')

        expertsAppPage.getPrivacyPolicy().should('be.visible').click()
        expertsAppPage.getPrivacyPolicyLink().then(value => {
            const splitValue = value.split('/')
            policyValue = splitValue[3]
            cy.readFile(path.join(downloadsFolder, policyValue)).should("exist");
        })

        expertsAppPage.getPrivacyPolicyNotice().should('be.visible').click()
        expertsAppPage.getPrivacyPolicyNoticeLink().then(value => {
            const splitValue = value.split('/')
            noticeValue = splitValue[3]
            cy.readFile(path.join(downloadsFolder, noticeValue)).should("exist");
        })
    })
})

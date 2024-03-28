import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

describe('DNC expert should not be able to login', { tags: "regression" }, function () {
    let expertFullName, testUsers, authToken, expertId, expertDetail
    const expertsAppPage = new ExpertsAppPage()
    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            expertFullName = `${testusers.expertDNCLogin.firstName} ${testusers.expertDNCLogin.lastName
                }`
            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
            })
        })
        cy.fixture('expertDetails').then(expertDetails => {
            expertDetail = expertDetails
        })
    })

    it('expert should able to login when expert status is Active', function () {
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL'))
        cy.get('body')
            .then(($body) => {
                if ($body.find('.single .icon svg').length) {
                    expertsAppPage.getSignOutBtn().click()
                }
            })
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL')).loginWithCredentials(testUsers.expertDNCLogin.emailAddress, Cypress.env('CYPRESS_EXTERNAL_PASSWORD'))
        expertsAppPage.getExpertName().should('contain', expertFullName)
    })

    it('expert should not be able to login when expert status is changed to DNC', function () {
        expertSearchRequestBody.expertData = expertFullName
        cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
            expertSearchResult => {
                expertId = expertSearchResult.body.hits.hits[0]._source.id
                cy.requestExpertSetStatus(authToken, expertId, {
                    commentPrefix: 'do not contact reason: ',
                    statusChangeComment: 'DNC expert should not be able to login'
                })
            })
        cy.reload()
        cy.visit(Cypress.env('EXPERTS_PLATFORM_APP_URL')).loginFailWithCredentials(testUsers.expertDNCLogin.emailAddress, Cypress.env('CYPRESS_EXTERNAL_PASSWORD'))
        expertsAppPage.getLoginErrorMessage().should('have.text', 'You are not allowed to access the platform')
    })

    it('expert should not able to access static compliance URL once expert status is DNC', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/compliance`)
        expertsAppPage.getExpertComplianceEmailAddress().type(testUsers.expertDNCLogin.emailAddress)
        expertsAppPage.getExpertComplianceNextButton().click()
        expertsAppPage.getExpertComplianceText().should('contain', expertDetail.complianceExpertMissingMessage)
    })

    it('expert status should change from DNC to contact again', function () {
        expertSearchRequestBody.expertData = expertFullName
        cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
            expertSearchResult => {
                expertId = expertSearchResult.body.hits.hits[0]._source.id
                cy.requestExpertSetStatus(authToken, expertId, {
                    commentPrefix: 'allow contact reason: ',
                    statusChangeComment: 'DNC expert should able to login again'
                })
            })
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/compliance`)
        expertsAppPage.getExpertComplianceEmailAddress().type(testUsers.expertDNCLogin.emailAddress)
        expertsAppPage.getExpertComplianceNextButton().click()
        expertsAppPage.getExpertComplianceText().should('contain', expertDetail.complianceExpertFoundMessage)
    })
})

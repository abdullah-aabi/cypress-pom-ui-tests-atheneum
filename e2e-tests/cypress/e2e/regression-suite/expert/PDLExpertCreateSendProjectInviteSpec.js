/* eslint-disable no-unused-expressions */
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import ExpertCreationPage from '../../../pageObjects/ExpertCreationPage'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

describe('Adding a PDL Expert', { tags: "regression" }, function () {
    let expertData, testUsers, expertId, eplId, userToken, projectDetails, projectId, employeeFullName
    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const expertDetailsPage = new ExpertDetailsPage()
    const expertCreationPage = new ExpertCreationPage()

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('projectDetails').then(testData => {
            projectDetails = testData
        })

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
            })
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            employeeFullName = `${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName}`

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                cy.setLocalStorageLoginInfo(
                    loginResponse.body.user,
                    loginResponse.body.token
                )
                userToken = loginResponse.body.token
                cy.requestSearchExperts(userToken, expertSearchRequestBody, true)
                // Select default project by visiting project page
                cy.visit(
                    `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId
                    }`
                )
                cy.waitForLoadingDisappear()
                //enable PDL expert results
                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
                globalPage.getClearSearchButton().click()
            })
        })
        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/expert-invite-template`).as('updateLanguage')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
    })

    it('should create a pdl expert by inviting into the project', function () {
        cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/**/pipeline`).as('expertPipeLine')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('eplBulkCreateRequest')
        expertSearchPage.getExpertNameField().type(`${expertData.pdlExperts.noFieldsExpert.fullName}{enter}`)

        cy.wait('@expertSearchRequest').its('response.statusCode').should('equal', 200)
        expertSearchPage.getExpertResultField().should('have.length', 1)
        expertSearchPage.getExpertResultField().contains(expertData.pdlExperts.noFieldsExpert.fullName)
        expertSearchPage.getUniqueExpert().first().click()
        expertInvitePage.getExpertInviteButton().contains('Interested').invoke('show').click({ force: true })
        cy.waitForLoadingDisappear()
        expertCreationPage
            .getIndustryExperienceField()
            .type(expertData.industryExperience)
        expertCreationPage.selectFromDateField()
        expertCreationPage.selectToDateField()
        expertCreationPage.getEmailField().type(`${expertData.pdlExperts.noFieldsExpert.emailAddress}`)
        globalPage.getButtonByName('Save').click()
        cy.wait(1000)
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        cy.wait(2000)
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId
            }`
        )
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectPipeline().click()
        cy.waitForLoadingDisappear()

        cy.wait('@expertPipeLine').its('response').then(expertPipeLineResponse => {
            expect(expertPipeLineResponse.statusCode).to.eq(200)
            expertId = expertPipeLineResponse.body[0].expert.id
            eplId = expertPipeLineResponse.body[0].id

            cy.waitForLoadingDisappear()
            cy.checkEPLStatus(expertData.pdlExperts.noFieldsExpert.fullName, 'Recruitment')
            projectDetailsPage.getEPLStatus().contains('Interested')

            cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${expertId}`)

            expertDetailsPage.getExpertName().contains(expertData.pdlExperts.noFieldsExpert.fullName)
            expertDetailsPage.getEmail().contains(expertData.pdlExperts.noFieldsExpert.emailAddress)

            cy.requestDeleteEPLById(userToken, eplId)
            cy.requestDeleteExpertById(userToken, expertId)
        })
    })
})


/// <reference types="Cypress" />
import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'

describe('KPMG Compliance', { tags: "regression" }, function () {
    let localStorage, expertFullName, projectId
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const expertPipelinePage = new ExpertPipelinPage()
    const projectDetailsPage = new ProjectDetailsPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testData').then(testData => {
            cy.fixture('testUsers').then(testUsers => {
                expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName
                    }`
                cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.KPMGOfficeName).then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id

                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)
                        cy.requestLogIn(
                            testUsers.accountManager.emailAddress,
                            Cypress.env('CYPRESS_USER_PASSWORD')
                        ).then(quickLoginResponse => {
                            localStorage = quickLoginResponse.body
                            cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                            cy.visit(
                                `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                            )
                        })
                    })
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('PUT', '**/api/project/**').as('waitForUpdatingProject')
        cy.intercept('PUT', `**/api/expert-project-link/**`).as('updateEPL')
    })

    it('Should check External compliance under project details', function () {
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectDetailsRowValueByName('Client office')
            .should('have.text', 'KPMG Berlin')
        projectDetailsPage.getProjectDetailsRowValueByName('Client account')
            .should('have.text', 'KPMG Germany')
        projectDetailsPage.getComplianceStatus()
            .should('have.text', 'Required')
        projectDetailsPage.getEditProjectBtn().click()
        projectDetailsPage.getExternalComplianceCheckbox()
            .should('have.value', 'true')
        projectDetailsPage.getExternalComplianceCheckbox().uncheck()
        projectDetailsPage.getEditSegmentFormSaveButton().click()
        cy.wait('@waitForUpdatingProject').its('response.statusCode').should('eq', 200)
        projectDetailsPage.getComplianceStatus()
            .should('have.text', 'Not required')
        cy.reload()
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        cy.changeEPLStatus(expertFullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.wait('@updateEPL').its('response.statusCode').should('eq', 200)
        cy.checkEPLStatus(expertFullName, 'Submitted')
        projectDetailsPage.getComplianceAuditFilter()
            .should('have.text', 'Submitted')
    })
})
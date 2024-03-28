/// <reference types="Cypress" />
import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ClientsAppPage from '../../../pageObjects/ClientsAppPage'

describe('Bain Compliance', { tags: "regression" }, function () {
    let localStorage, users, expertFullName, projectId, clientProjectLink
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const expertPipelinePage = new ExpertPipelinPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const clientsAppPage = new ClientsAppPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testData').then(testData => {
            cy.fixture('testUsers').then(testUsers => {
                users = testUsers
                expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName}`
                cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.BainOfficeName).then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)
                        cy.requestLogIn(
                            testUsers.accountManager.emailAddress,
                            Cypress.env('CYPRESS_USER_PASSWORD')
                        ).then(quickLoginResponse => {
                            localStorage = quickLoginResponse.body
                            cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                            cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
                        })
                    })

                cy.requestClientsLogin(users.bainComplianceAuditor.emailAddress, Cypress.env('CYPRESS_EXTERNAL_PASSWORD')).then(
                    loginResponse => cy.requestClientsGetProjectExternLink(loginResponse.body.token, projectId).then(
                        projectLinkResponse => {
                            clientProjectLink = projectLinkResponse.body.externLink
                        })
                )
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('PUT', '**/expert-project-link/**').as('waitForUpdateEPL')
    })

    it('Should check External compliance under project details', function () {
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectDetailsRowValueByName('Client office')
            .should('have.text', 'Bain Berlin')
        projectDetailsPage.getProjectDetailsRowValueByName('Client account')
            .should('have.text', 'Bain Germany')
        projectDetailsPage.getComplianceStatus()
            .should('have.text', 'Required')
    })

    it('Should change EPL Status to Submitted and Request CID', function () {
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        cy.changeEPLStatus(expertFullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.wait('@waitForUpdateEPL').its('response.statusCode').should('eq', 200)
        cy.checkEPLStatus(expertFullName, 'Submitted')
        expertPipelinePage.getBainStatus(1).should('contain.text', 'Request CID')
        cy.visit(clientProjectLink)
        clientsAppPage.getEPLActionBtn(1).should('contain.text', 'Request CID')
    })

    it('Should Reuest CID from platform', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        expertPipelinePage.getBainStatus(1).click()
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.wait('@waitForUpdateEPL').its('response.statusCode').should('eq', 200)
        cy.checkEPLStatus(expertFullName, 'CID Pending')
    })

    it('Should Clear CID from client interface', function () {
        cy.visit(clientProjectLink)
        clientsAppPage.getEPLActionBtn(1).should('contain.text', 'Clear CID')
        clientsAppPage.getEPLActionBtn(1).click()
        cy.wait(500)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        expertPipelinePage.getBainStatus(1).should('contain.text', 'Schedule')
    })

    it('Should Fail CID from client interface', function () {
        cy.visit(clientProjectLink)
        clientsAppPage.getEPLActionBtn(2).should('contain.text', 'Fail CID')
        clientsAppPage.getEPLActionBtn(2).click()
        cy.wait(500)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
        cy.waitForLoadingDisappear()
        expertPipelinePage.getBainStatus(1).should('contain.text', 'Request CID')
        cy.checkEPLStatus(expertFullName, 'CID Failed')
    })

})
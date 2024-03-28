import generator from '../../../support/generator'
import ProjectsPipelinePage from '../../../pageObjects/ProjectsPipelinePage'

describe('Check Revenues report as Team Leader', { tags: "regression" }, function () {
    let authInfo, projectId, atheneumOffice, authToken, testUsers, expertFullName, employeeId

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const projectsPipelinePage = new ProjectsPipelinePage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.teamLeader.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
                authInfo = loginResponse
            })
        })
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName}`
            cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
                projectCreateResponse => {
                    projectId = projectCreateResponse.body.id
                    atheneumOffice = projectCreateResponse.body.atheneumOfficeId
                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)
                })
        })
    })

    beforeEach(function () {
        cy.intercept('GET', '**/api/project/projects-pipeline').as('waitForProjectsPipelinePage')
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    })

    it('Should show project pipelines default page under reports', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/reports/projects-pipeline`)
        cy.wait('@waitForProjectsPipelinePage').its('response.statusCode').should('eq', 200)
        cy.requestProjectPipeline(authToken, '', '').then(
            ProjectsPipelineReportResult => {
                projectsPipelinePage.getProjectsPipelineResults()
                    .should('have.length', ProjectsPipelineReportResult.body.projects.length + 1)
                projectsPipelinePage.getProjectsPipelineResults().contains(projectName)
            })
    })

    it('Should show projects pipeline for selected Atheneum contact', function () {
        projectsPipelinePage.selectAtheneumContact('Test AccountManager')
        cy.requestGetEmployees(authToken, 'Test AccountManager').then(getEmployeeResponse => {
            employeeId = getEmployeeResponse.body.rows[0].id
            cy.requestProjectPipeline(authToken, employeeId, '').then(
                ProjectsPipelineReportResult => {
                    projectsPipelinePage.getProjectsPipelineResults()
                        .should('have.length', ProjectsPipelineReportResult.body.projects.length + 1)
                    projectsPipelinePage.getProjectsPipelineResults().contains(projectName)
                })
        })
    })

    it('Should show projects pipeline for selected Atheneum office', function () {
        projectsPipelinePage.selectAtheneumOffice('Berlin')
        cy.requestProjectPipeline(authToken, employeeId, atheneumOffice).then(
            ProjectsPipelineReportResult => {
                projectsPipelinePage.getProjectsPipelineResults()
                    .should('have.length', ProjectsPipelineReportResult.body.projects.length + 1)
                projectsPipelinePage.getProjectsPipelineResults().contains(projectName)
            })
    })
})

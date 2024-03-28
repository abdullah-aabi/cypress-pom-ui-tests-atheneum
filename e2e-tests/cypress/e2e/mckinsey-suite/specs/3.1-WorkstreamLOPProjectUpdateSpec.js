/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { recurse } from 'cypress-recurse'
const projectSearchRequestBody = require('../../../fixtures/objects/projectSearchObject.json')

describe('Mckinsey LOP project create from API', { tags: "mckinsey" }, function () {
    let authToken,
        testData,
        userDetails

    const projectDetailsPage = new ProjectDetailsPage()
    const projectName = `${generator.generateTestName()} McKinsey project`
    projectSearchRequestBody.keyword = projectName

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        project_location: null,
        project_type: "LOP",
        mckinsey_message_id: `message_${generator.generateTestName()}`
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('objects/mckinseyWorkstream').then(mckinseyWorkstreamObject => testData = { ...mckinseyWorkstreamObject })

        cy.postMckinseyProject(projectData).then(webhookNotification => {
            const parsedProjectResponse = JSON.parse(JSON.parse(webhookNotification.body))
            projectData.mckinsey_project_id = parsedProjectResponse.project_id
            projectData.mckinsey_client_id = parsedProjectResponse.client_id
        })

        cy.postMckinseyWorkstream(projectData).then(webhookNotification => {
            const parsedWorkstreamResponse = JSON.parse(JSON.parse(webhookNotification.body))
            projectData.mckinsey_workstream_id = parsedWorkstreamResponse.workstream_id
        })

        cy.fixture('testUsers').then(testUsers => {
            userDetails = testUsers.accountManager
            cy.requestLogIn(
                userDetails.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body

                recurse(
                    () => cy.requestSearchProject(authToken.token, projectSearchRequestBody).then((projectSearchResult) => {
                        return projectSearchResult.body.hits.hits.filter(result => result._source.name === projectName)
                    })
                    , (searchResult) => {
                        expect(searchResult.length).to.eq(1)
                    },
                    {
                        limit: 10,
                        delay: 3000
                    },
                )

                cy.requestSearchProject(authToken.token, projectSearchRequestBody).then((projectSearchResult) => {
                    projectData.platform_project_id = projectSearchResult.body.hits.hits.filter(result => result._source.name === projectName)[0]._source.id
                })
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}`)
        cy.waitForLoadingDisappear()
    })

    it('should check the notification is sent to ENS when workstream is created', function () {
        projectDetailsPage.getProjectName().should('have.text', projectName)
        projectDetailsPage.getProjectMckinseyBackground().should('have.text', testData.project_description)
        projectDetailsPage.getProjectMckinseyCustomer().should('have.text', `Customer Of: ${testData.customer_of_type}`)
        projectDetailsPage.getProjectMckinseySeniority().should('have.text', `Seniority: ${testData.seniority}`)
        projectDetailsPage.getProjectMckinseyJobs().should('have.text', `Jobs/Roles: ${testData.roles}`)
        projectDetailsPage.getProjectMckinseyGeographies().should('have.text', `Geographies: ${testData.geography[0]}`)
        projectDetailsPage.getProjectMckinseyTarget().should('have.text', `Target Company: ${testData.target_company}`)

        projectDetailsPage.getProjectDetailsRowValueByName('Type').should('have.text', 'Expert Sessions')
        projectDetailsPage.getProjectDetailsRowValueByName('Client office').should('contain.text', 'McKinsey & Company')
        projectDetailsPage.getProjectDetailsRowValueByName('Client account').should('contain.text', 'McKinsey & Company')

        projectDetailsPage.getProjectSegments().should('contain.text', projectData.workstream_name)
        projectDetailsPage.getProjectRequiredInterviews().should('have.text', testData.requested_number_of_calls)
        projectDetailsPage.getProjectTarget().should('have.text', testData.total_requested_number_of_calls)
        projectDetailsPage.getProjectDetailsValueByRowName('Project Type').should('have.text', 'LOP')

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('API New Workstream')

        projectDetailsPage.getProjectCorrespondanceBody()
            .should('contain.text', projectData.workstream_name)
            .should('contain.text', `Workstream/Profile: ${projectData.workstream_name}`)
            .should('contain.text', `Details: ${testData.workstream_description}`)
            .should('contain.text', `Geographies: ${testData.geography[0]}`)
            .should('contain.text', `Seniority: ${testData.seniority}`)
            .should('contain.text', `Jobs/Roles: ${testData.roles}`)
            .should('contain.text', `Expected Calls: ${testData.requested_number_of_calls}`)
            .should('contain.text', `Project Name: ${projectName}`)
            .should('contain.text', `Project Brief: ${testData.project_description}`)
            .should('contain.text', `Expected calls: ${testData.total_requested_number_of_calls}`)
    })
})

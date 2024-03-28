import ExpertPipelinPage from '../pageObjects/ExpertPipelinePage'
import { recurse } from 'cypress-recurse'
const projectSearchRequestBody = require('../fixtures/objects/projectSearchObject.json')

Cypress.Commands.add('createMckinseyProjectWithExpertInStatus', (employeeType, projectData, expertData, eplStatus = 'submitted') => {
    const expertPipelinePage = new ExpertPipelinPage()
    projectSearchRequestBody.keyword = projectData.project_name
    let staticDataResponse;

    cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/submit`).as('mckSubmitRequest')
    cy.intercept('POST', '/api/expert-project-link/convert-fee-currency').as('requestPostCovertFee')
    cy.intercept('PUT', '/api/expert-project-link/*/expanded').as('requestUpdateEPL')
    cy.intercept('GET', '/api/expert-project-link/*').as('getEPLRequest')

    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

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

        cy.requestLogIn(
            testUsers[employeeType].emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
        ).then(loginResponse => {
            cy.setLocalStorageLoginInfo(loginResponse.body.user, loginResponse.body.token)

            cy.createExpertWithParameters(loginResponse.body.token, expertData).then(expertId => {
                expertData.expertId = expertId.body.id
            })

            cy.requestGetStaticData(loginResponse.body.token).then(staticData => {
                staticDataResponse = staticData.body
            })

            recurse(
                () => cy.requestSearchProject(loginResponse.body.token, projectSearchRequestBody).then((projectSearchResult) => {
                    return projectSearchResult.body.hits.hits.filter(result => result._source.name === projectData.project_name)
                })
                , (searchResult) => {
                    expect(searchResult.length).to.eq(1)
                },
                {
                    limit: 15,
                    delay: 3000
                },
            )

            cy.requestSearchProject(loginResponse.body.token, projectSearchRequestBody).then((projectSearchResult) => {
                projectData.platform_project_id = projectSearchResult.body.hits.hits.filter(result => result._source.name === projectData.project_name)[0]._source.id

                cy.addAndInviteExpertToProjectFromAPI(projectData.platform_project_id, expertData.expertId).then(eplResponse => {
                    cy.fixture('objects/eplExpandedObject').then(eplRequestBody => {
                        eplRequestBody.segmentId = eplResponse.body.segmentId
                        eplRequestBody.fee = projectData.fee
                        eplRequestBody.feeCurrencyId = staticDataResponse.currencies.find(currency => currency.name === projectData.feeCurrency).id

                        cy.requestPutEPLExpanded(eplResponse.requestHeaders.Authorization, eplResponse.body.id, eplRequestBody)
                    })

                })
                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/experts-pipeline`)
                cy.waitForLoadingDisappear()
            })
        })
    })
    cy.wait(500)

    cy.changeEPLStatus(expertData.originalName, 'Submitted')
    expertPipelinePage.getEplStatusConfirmButton().click()

    cy.wait('@requestPostCovertFee')
    cy.wait('@mckSubmitRequest').its('response.statusCode').should('equal', 200)

    if (eplStatus === 'client_suggests_availability') {
        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.checkEPLStatusForCapi(expertData.originalName, 'Submitted')

        cy.postMckinseyCallClientSuggestsAvailability(projectData)
    }

    else if (eplStatus === 'client_requests_availability') {
        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.checkEPLStatusForCapi(expertData.originalName, 'Submitted')

        cy.postMckinseyCallClientRequestsAvailability(projectData)
    }

    else if (eplStatus === 'expert_suggests_availability') {
        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.checkEPLStatusForCapi(expertData.originalName, 'Submitted')

        cy.postMckinseyCallExpertSuggestsAvailability(projectData)
    }

    else if (eplStatus === 'schedule') {
        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.checkEPLStatusForCapi(expertData.originalName, 'Submitted')

        cy.postMckinseyCallClientSuggestsAvailability(projectData).then(callIDResponse => {
            const parsedResponse = JSON.parse(JSON.parse(callIDResponse.body))
            projectData.call_id = parsedResponse.call_id
        })

        cy.postMckinseyCallScheduled(projectData)
    }

    else if (eplStatus === 'completed') {
        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.checkEPLStatusForCapi(expertData.originalName, 'Submitted')

        cy.postMckinseyCallClientSuggestsAvailability(projectData).then(callIDResponse => {
            const parsedResponse = JSON.parse(JSON.parse(callIDResponse.body))
            projectData.call_id = parsedResponse.call_id
        })

        cy.postMckinseyCallScheduled(projectData)
        cy.postMckinseyCallCompleted(projectData)
    }
})
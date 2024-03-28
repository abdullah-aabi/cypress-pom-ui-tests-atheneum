/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { recurse } from 'cypress-recurse'
const projectSearchRequestBody = require('../../../fixtures/objects/projectSearchObject.json')

// TODO research other windows resize implementations for mobile
describe.skip('Checking Correspondence tab mobile view', { tags: "mckinsey" }, function () {
    let authToken,
        testData,
        userDetails

    const projectDetailsPage = new ProjectDetailsPage()
    const projectName = `${generator.generateTestName()} McKinsey project`

    const projectData = {
        platform_project_id: "",
        mckinsey_client_id: "",
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        mckinsey_workstream_id: ""
    }

    before(function () {
        cy.viewport('iphone-x').visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)

        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            userDetails = testUsers.accountManager
            cy.requestLogIn(
                userDetails.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body

                cy.fixture('objects/mckinseyProject').then(mckinseyProjectObject => {
                    mckinseyProjectObject.name = projectName
                    mckinseyProjectObject.message_id = projectData.mckinsey_message_id

                    projectSearchRequestBody.keyword = projectName

                    cy.requestPostMckinseyProject(mckinseyProjectObject).then(
                        response => {
                            expect(response.status).to.eq(200)

                            cy.task('getWebhookNotifications', '/projects/connect', 10, {
                                timeout: 110000,
                            }).then(webhookNotification => {
                                cy.log(webhookNotification.body)
                                expect(webhookNotification.path).to.eq('/projects/connect')
                                expect(webhookNotification.method).to.eq('POST')

                                const parsedProjectResponse = JSON.parse(JSON.parse(webhookNotification.body))
                                projectData.mckinsey_project_id = parsedProjectResponse.project_id
                                projectData.mckinsey_client_id = parsedProjectResponse.client_id

                                expect(parsedProjectResponse.message_id).to.eq(projectData.mckinsey_message_id)
                                expect(parsedProjectResponse.project_id).to.include('mckinsey-')


                                cy.fixture('objects/mckinseyWorkstream').then(testdata => {
                                    testData = testdata
                                    testData.project_name = projectName
                                    testData.project_id = projectData.mckinsey_project_id
                                    testData.client_id = projectData.mckinsey_client_id
                                    testData.message_id = projectData.mckinsey_message_id

                                    testData.workstream_name = `${projectName} workstream`

                                    cy.requestPostMckinseyWorksteam(testData).then(
                                        workstreamPostResponse => {
                                            expect(workstreamPostResponse.status).to.eq(200)

                                            cy.task('getWebhookNotifications', '/workstreams/connect', 10, {
                                                timeout: 110000,
                                            }).then(webhookNotification => {
                                                cy.log(webhookNotification.body)
                                                expect(webhookNotification.path).to.eq('/workstreams/connect')
                                                expect(webhookNotification.method).to.eq('POST')

                                                const parsedWorkstreamResponse = JSON.parse(JSON.parse(webhookNotification.body))

                                                expect(parsedWorkstreamResponse.message_id).to.eq(projectData.mckinsey_message_id)
                                                expect(parsedWorkstreamResponse.workstream_id).to.include('mckinsey-')
                                                expect(parsedWorkstreamResponse.client_id).to.eq(projectData.mckinsey_client_id)
                                                expect(parsedWorkstreamResponse.project_id).to.eq(projectData.mckinsey_project_id)

                                                projectData.mckinsey_workstream_id = parsedWorkstreamResponse.workstream_id
                                            })
                                        })
                                })
                            })
                        }
                    )
                })

                recurse(
                    () => cy.requestSearchProject(authToken.token, projectSearchRequestBody).then((projectSearchResult) => {
                        return projectSearchResult.body.hits.hits.filter(result => result._source.name === projectName)
                    })
                    , (searchResult) => {
                        expect(searchResult.length).to.eq(1)
                    },
                    {
                        limit: 15,
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
        cy.window().then((win) => {

            win.resizeTo(375, 812)
            cy.log(win.screen)
        })
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/correspondence`)
        cy.waitForLoadingDisappear()
    })

    it('should search the project by project name using Search Anything method iPhone', function () {
        cy.reload()
        projectDetailsPage.getProjectCorrespondanceMobileTitle()
        // cy.percySnapshot('iphone.correspondence.all', { widths: [375], minHeight: 812 })

        projectDetailsPage.clickProjectCorrespondanceMobileFilters('Chat')

        // cy.percySnapshot('iphone.correspondence.chat', { widths: [375], minHeight: 812 })

        projectDetailsPage.getProjectCorrespondanceMobileTitle().each(correspondenceTitle =>
            expect(correspondenceTitle.text()).to.eq('Workstream'))

        projectDetailsPage.getProjectCorrespondanceMobileTitle().last().click()

        projectDetailsPage.getProjectCorrespondanceMobileMessage().last().should('be.visible')
    })

    // it('should reply to the Mckinsey workstream with a chat message', function () {
    //     projectDetailsPage.getProjectName().should('have.text', projectName)

    //     mckinseyChatBody.project_id = projectData.mckinsey_project_id
    //     mckinseyChatBody.workstream_id = projectData.mckinsey_workstream_id
    //     mckinseyChatBody.client_id = projectData.mckinsey_client_id


    //     projectDetailsPage.getProjectCorrespondance().click()
    //     projectDetailsPage.clickProjectCorrespondanceBySubject('API New Workstream')

    //     globalPage.getButtonByName('Reply').click()

    //     projectDetailsPage.getProjectCorrespondanceBodyTextarea().type(mckinseyChatBody.text)

    //     globalPage.getButtonByName('Send').click()

    //     cy.task('getWebhookNotifications', '/chat/messages', 10, {
    //         timeout: 110000,
    //     }).then(webhookNotification => {
    //         cy.log(JSON.parse(webhookNotification.body))
    //         expect(webhookNotification.path).to.eq('/chat/messages')
    //         expect(webhookNotification.method).to.eq('POST')

    //         const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))

    //         cy.log(parsedResponse)
    //         expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
    //         expect(parsedResponse.text).to.contain(mckinseyChatBody.text)
    //     })

    //     cy.reload()

    //     projectDetailsPage.getProjectCorrespondanceSubject(1)
    //         .should('have.text', 'RE: API New Workstream')
    //         .click()

    //     projectDetailsPage.getProjectCorrespondanceBodyChat()
    //         .should('contain.text', mckinseyChatBody.text)
    // })
})
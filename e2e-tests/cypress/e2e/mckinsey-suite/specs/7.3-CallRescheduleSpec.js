/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'
import { recurse } from 'cypress-recurse'
const projectSearchRequestBody = require('../../../fixtures/objects/projectSearchObject.json')

describe.skip('Mckinsey canceling and rescheduling calls from API', { tags: "mckinsey" }, function () {
    let workstreamName,
        authToken,
        userDetails

    const expertPipelinePage = new ExpertPipelinPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const projectName = `${generator.generateTestName()} McKinsey project`
    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()
    projectSearchRequestBody.keyword = projectName

    const expertData = {
        firstName: firstName,
        lastName: lastName,
        originalName: `${firstName} ${lastName}`,
        email: `${firstName + lastName}@mail.com`,
        complainceSigned: true
    }

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        expert_original_name: expertData.originalName,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        startAt: generator.generateDateAddMinutesLater(30),
        startAtDelayed: generator.generateDateAddMinutesLater(60)
    }

    before(function () {
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
            userDetails = testUsers.teamLeader

            cy.requestLogIn(
                testUsers.accountManager.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                cy.createExpertWithParameters(loginResponse.body.token, expertData).then(expertId => {
                    expertData.expertId = expertId.body.id
                })
            })

            cy.requestLogIn(
                userDetails.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body

                cy.setLocalStorageLoginInfo(authToken.user, authToken.token)

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

                    cy.addAndInviteExpertToProjectFromAPI(projectData.platform_project_id, expertData.expertId)
                    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/experts-pipeline`)
                    cy.waitForLoadingDisappear()
                })

            })
        })
    })

    it('should schedule call, re-schedule the same call, create a call update and reply to ENS', function () {
        cy.wait(500)

        cy.clickEplExpertToExpand(expertData.originalName)
        expertPipelinePage.selectFeeCurrencyByValue('USD')
        cy.verifyNotificationAndClose()

        expertPipelinePage.getFeeAmountField().type(1650)
        expertPipelinePage.getIconForFeeDescription().should('be.visible').click()
        cy.verifyNotificationAndClose()

        cy.changeEPLStatus(expertData.originalName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()

        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.checkEPLStatus(expertData.originalName, 'Submitted')

        cy.postMckinseyCallClientSuggestsAvailability(projectData).then(callIDResponse => {
            const parsedResponse = JSON.parse(JSON.parse(callIDResponse.body))
            projectData.mckinsey_call_id = parsedResponse.call_id
        })

        cy.postMckinseyCallScheduled(projectData)

        cy.reload()
        cy.checkEPLStatus(expertData.originalName, 'Scheduled')
        projectDetailsPage.checkEPLScheduledTime(expertData.originalName, generator.convertDateToFormat(projectData.startAt, 'HH:mm'))

        // cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
        //     mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
        //     mckinseyScheduleCallObject.projec_name = projectName
        //     mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
        //     mckinseyScheduleCallObject.workstream_name = workstreamName
        //     mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
        //     mckinseyScheduleCallObject.expert_name = expertData.originalName
        //     mckinseyScheduleCallObject.call_id = projectData.mckinsey_call_id
        //     mckinseyScheduleCallObject.existingCallStatus = "client_suggests_timeslots"
        //     mckinseyScheduleCallObject.existingCallId = parseInt(projectData.mckinsey_call_id.replace('mckinsey-', ''))
        //     mckinseyScheduleCallObject.status = 'canceled'


        //     cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
        //         expect(requestAvailabilityResponse.status).to.eq(200)

        //         cy.task('getWebhookNotifications', '/calls/connect', 10, {
        //             timeout: 110000,
        //         }).then(webhookNotification => {
        //             cy.log(JSON.parse(webhookNotification.body))
        //             expect(webhookNotification.path).to.eq('/calls/connect')
        //             expect(webhookNotification.method).to.eq('POST')

        //             const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
        //             expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
        //             expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
        //             expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)

        //             expect(parsedResponse.call_id).to.eq(projectData.mckinsey_call_id)
        //         })
        //     })
        // })

        projectDetailsPage.getProjectCorrespondance().click()

        // projectDetailsPage.clickProjectCorrespondanceBySubject('API Update Call')

        // projectDetailsPage.getProjectCorrespondanceBodyChat()
        //     .should('contain.text', `workstream_name: ${workstreamName}`)
        //     .should('contain.text', `projec_name: ${projectName}`)
        //     .should('contain.text', `expert_name: ${expertData.originalName}`)
        //     .should('contain.text', `call_id: ${projectData.mckinsey_call_id}`)
        //     .should('contain.text', 'status: canceled')

        cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
            mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
            mckinseyScheduleCallObject.projec_name = projectName
            mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
            mckinseyScheduleCallObject.workstream_name = workstreamName
            mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
            mckinseyScheduleCallObject.expert_name = expertData.originalName
            mckinseyScheduleCallObject.start_at = projectData.startAtDelayed
            mckinseyScheduleCallObject.call_id = projectData.mckinsey_call_id
            mckinseyScheduleCallObject.existingCallStatus = "scheduled"
            mckinseyScheduleCallObject.existingCallId = parseInt(projectData.mckinsey_call_id.replace('mckinsey-', ''))
            mckinseyScheduleCallObject.status = 'scheduled'

            cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
                expect(requestAvailabilityResponse.status).to.eq(200)

                cy.task('getWebhookNotifications', '/calls/connect', 10, {
                    timeout: 110000,
                }).then(webhookNotification => {
                    cy.log(JSON.parse(webhookNotification.body))
                    expect(webhookNotification.path).to.eq('/calls/connect')
                    expect(webhookNotification.method).to.eq('POST')

                    const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                    expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                    expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                    expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)

                    expect(parsedResponse.call_id).to.eq(projectData.mckinsey_call_id)
                })
            })

            // cy.reload()
            projectDetailsPage.clickProjectCorrespondanceBySubject('Call Update')

            projectDetailsPage.getProjectCorrespondanceBodyChat()
                .should('contain.text', `Workstream name: ${workstreamName}`)
                .should('contain.text', `Projec name: ${projectName}`)
                .should('contain.text', `Expert name: ${expertData.originalName}`)
                .should('contain.text', 'Status: scheduled')
                .should('contain.text', `Callid: ${projectData.mckinsey_call_id}`)
                .should('contain.text', 'Requested duration: 60')
                .should('contain.text', `Start at: ${projectData.startAtDelayed}`)

            projectDetailsPage.getProjectPipeline().click()
            cy.checkEPLStatus(expertData.originalName, 'Scheduled')

            //TODO remove comment when Richard is done with the changes
            // projectDetailsPage.checkEPLScheduledTime(expertData.originalName, generator.convertDateToFormat(projectData.startAtDelayed, 'HH:mm'))
        })
    })
})

Cypress.Commands.add(
    'postMckinseyProject', (projectData) => {
        cy.fixture('objects/mckinseyProject').then(mckinseyProjectObject => {
            mckinseyProjectObject.name = projectData.project_name
            mckinseyProjectObject.message_id = projectData.mckinsey_message_id

            if (projectData.project_location !== undefined) {
                mckinseyProjectObject.project_location = projectData.project_location
            }

            if (projectData.project_type !== undefined) {
                mckinseyProjectObject.type = projectData.project_type
            }

            cy.requestPostMckinseyProject(mckinseyProjectObject).then(
                response => {
                    expect(response.status).to.eq(200)

                    cy.task('getWebhookNotifications', '/mock-mckinsey-api/projects/connect', 10, {
                        timeout: 110000,
                    }).then(webhookNotification => {
                        console.log(webhookNotification)
                        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/projects/connect')
                        expect(webhookNotification.method).to.eq('POST')

                        const parsedProjectResponse = JSON.parse(JSON.parse(webhookNotification.body))
                        expect(parsedProjectResponse.message_id).to.eq(projectData.mckinsey_message_id)
                        expect(parsedProjectResponse.project_id).to.include('mckinsey-')
                        return webhookNotification
                    })
                })
        })
    })

Cypress.Commands.add(
    'postMckinseyWorkstream', (projectData) => {
        cy.fixture('objects/mckinseyWorkstream').then(mckinseyWorkstreamObject => {
            mckinseyWorkstreamObject.project_name = projectData.project_name
            mckinseyWorkstreamObject.project_id = projectData.mckinsey_project_id
            mckinseyWorkstreamObject.client_id = projectData.mckinsey_client_id
            mckinseyWorkstreamObject.message_id = projectData.mckinsey_message_id
            mckinseyWorkstreamObject.workstream_name = projectData.workstream_name
            mckinseyWorkstreamObject.project_charge_code = projectData.project_charge_code

            
            mckinseyWorkstreamObject.workstream_id = (projectData.mckinsey_workstream_id !== undefined) ? projectData.mckinsey_workstream_id : mckinseyWorkstreamObject.workstream_id
            mckinseyWorkstreamObject.screening_questions = (projectData.screening_questions !== undefined) ? projectData.screening_questions : mckinseyWorkstreamObject.screening_questions
            mckinseyWorkstreamObject.project_description = (projectData.project_description !== undefined) ? projectData.project_description : mckinseyWorkstreamObject.project_description
            mckinseyWorkstreamObject.live = (projectData.live !== undefined) ? projectData.live : mckinseyWorkstreamObject.live


            cy.requestPostMckinseyWorksteam(mckinseyWorkstreamObject).then(
                workstreamPostResponse => {
                    expect(workstreamPostResponse.status).to.eq(200)

                    cy.task('getWebhookNotifications', '/mock-mckinsey-api/workstreams/connect', 10, {
                        timeout: 110000,
                    }).then(webhookNotification => {
                        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/workstreams/connect')
                        expect(webhookNotification.method).to.eq('POST')

                        const parsedWorkstreamResponse = JSON.parse(JSON.parse(webhookNotification.body))

                        expect(parsedWorkstreamResponse.message_id).to.eq(projectData.mckinsey_message_id)
                        expect(parsedWorkstreamResponse.workstream_id).to.include('mckinsey-')
                        expect(parsedWorkstreamResponse.client_id).to.eq(projectData.mckinsey_client_id)
                        expect(parsedWorkstreamResponse.project_id).to.eq(projectData.mckinsey_project_id)

                        projectData.mckinsey_workstream_id = parsedWorkstreamResponse.workstream_id
                        return webhookNotification
                    })
                })
        })
    })

Cypress.Commands.add('getMckinseyExpertSubmit', (projectData) => {
    cy.task('getWebhookNotifications', '/mock-mckinsey-api/experts/submit', 10, {
        timeout: 110000,
    }).then(webhookNotification => {
        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/experts/submit')
        expect(webhookNotification.method).to.eq('POST')

        const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
        expect(`${parsedResponse.first_name} ${parsedResponse.last_name}`).to.eq(projectData.expert_original_name)
        expect(parsedResponse.expert_id).to.include('mckinsey-')
        expect(parsedResponse.action).to.eq('create')
        expect(parsedResponse.client_id).to.eq(projectData.mckinsey_client_id)
        expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
        expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
        return webhookNotification
    })
})

Cypress.Commands.add('getMckinseyExpertReject', (projectData) => {
    cy.task('getWebhookNotifications', '/mock-mckinsey-api/experts/reject', 10, {
        timeout: 110000,
    }).then(webhookNotification => {
        cy.log(webhookNotification.body)
        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/experts/reject')
        expect(webhookNotification.method).to.eq('POST')

        const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
        expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
    })
})

Cypress.Commands.add('postMckinseyCallClientRequestsAvailability', (projectData) => {
    cy.fixture('objects/mckinseyCallsObject').then(requestAvailabilityObject => {
        requestAvailabilityObject.project_id = projectData.mckinsey_project_id
        requestAvailabilityObject.projec_name = projectData.project_name
        requestAvailabilityObject.workstream_id = projectData.mckinsey_workstream_id
        requestAvailabilityObject.workstream_name = projectData.workstream_name
        requestAvailabilityObject.expert_id = projectData.mckinsey_expert_id
        requestAvailabilityObject.expert_name = projectData.expert_original_name
        requestAvailabilityObject.booking_url = Cypress.env('LEGACY_PLATFORM_APP_URL')
        requestAvailabilityObject.mck_call_id = projectData.mckinsey_call_id
        requestAvailabilityObject.status = 'client_requests_availability'
        requestAvailabilityObject.in_compliance_review = (projectData.in_compliance_review !== undefined) ? projectData.in_compliance_review : requestAvailabilityObject.in_compliance_review

        cy.requestPostMckinseyCall(requestAvailabilityObject).then(requestAvailabilityResponse => {
            expect(requestAvailabilityResponse.status).to.eq(200)

            cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/connect', 10, {
                timeout: 110000,
            }).then(webhookNotification => {
                expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/connect')
                expect(webhookNotification.method).to.eq('POST')

                const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
                expect(parsedResponse.call_id).to.include('mckinsey-')
                return webhookNotification
            })
        })
    })
})

Cypress.Commands.add('postMckinseyCallClientSuggestsAvailability', (projectData) => {
    cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
        mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
        mckinseyScheduleCallObject.projec_name = projectData.project_name
        mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
        mckinseyScheduleCallObject.workstream_name = projectData.workstream_name
        mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
        mckinseyScheduleCallObject.expert_name = projectData.expert_original_name
        mckinseyScheduleCallObject.provided_slots = [projectData.startAt]
        mckinseyScheduleCallObject.status = 'client_suggests_timeslots'
        mckinseyScheduleCallObject.mck_call_id = projectData.mckinsey_call_id
        mckinseyScheduleCallObject.dialin_code = "913500"
        mckinseyScheduleCallObject.dialin_phone_numbers = [
            {
                "country_code": "AR",
                "international_format": "+542215137601",
                "local_format": "0221 513-7601",
                "local_only": false
            }]

        cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
            expect(requestAvailabilityResponse.status).to.eq(200)

            cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/connect', 10, {
                timeout: 110000,
            }).then(webhookNotification => {
                expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/connect')
                expect(webhookNotification.method).to.eq('POST')

                const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
                expect(parsedResponse.call_id).to.include('mckinsey-')
                return webhookNotification
            })
        })
    })
})

Cypress.Commands.add('postMckinseyCallExpertSuggestsAvailability', (projectData) => {
    cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
        mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
        mckinseyScheduleCallObject.projec_name = projectData.project_name
        mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
        mckinseyScheduleCallObject.workstream_name = projectData.workstream_name
        mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
        mckinseyScheduleCallObject.expert_name = projectData.expert_original_name
        mckinseyScheduleCallObject.provided_slots = [projectData.startAt]
        mckinseyScheduleCallObject.status = 'expert_suggests_timeslots'
        mckinseyScheduleCallObject.mck_call_id = projectData.mckinsey_call_id

        cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
            expect(requestAvailabilityResponse.status).to.eq(200)

            cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/connect', 10, {
                timeout: 110000,
            }).then(webhookNotification => {
                cy.log(JSON.parse(webhookNotification.body))
                expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/connect')
                expect(webhookNotification.method).to.eq('POST')

                const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
                expect(parsedResponse.call_id).to.include('mckinsey-')
            })
        })
    })
})

Cypress.Commands.add('getMckinseyCallScheduled', (projectData) => {
    cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/schedule', 10, {
        timeout: 110000,
    }).then(webhookNotification => {
        cy.log(JSON.parse(webhookNotification.body))
        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/schedule')
        expect(webhookNotification.method).to.eq('POST')

        const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
        expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
        expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
        expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
        expect(parsedResponse.call_id).to.include('mckinsey-')
    })
})

Cypress.Commands.add('postMckinseyCallScheduled', (projectData) => {
    cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
        mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
        mckinseyScheduleCallObject.projec_name = projectData.project_name
        mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
        mckinseyScheduleCallObject.workstream_name = projectData.workstream_name
        mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
        mckinseyScheduleCallObject.expert_name = projectData.expert_original_name
        mckinseyScheduleCallObject.start_at = projectData.startAt
        mckinseyScheduleCallObject.mck_call_id = projectData.mckinsey_call_id
        // mckinseyScheduleCallObject.existingCallStatus = "client_suggests_timeslots"
        // mckinseyScheduleCallObject.existingCallId = parseInt(projectData.call_id.replace('mckinsey-', ''))
        mckinseyScheduleCallObject.status = 'scheduled'
        mckinseyScheduleCallObject.join_call_url = 'https://atheneum.ai'
        mckinseyScheduleCallObject.dialin_code = "913500"
        mckinseyScheduleCallObject.dialin_phone_numbers = [
            {
                "country_code": "AR",
                "international_format": "+542215137601",
                "local_format": "0221 513-7601",
                "local_only": false
            }]


        cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
            expect(requestAvailabilityResponse.status).to.eq(200)

            cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/connect', 10, {
                timeout: 110000,
            }).then(webhookNotification => {
                cy.log(JSON.parse(webhookNotification.body))
                expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/connect')
                expect(webhookNotification.method).to.eq('POST')

                const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
                expect(parsedResponse.call_id).to.eq(projectData.call_id)
            })
        })
    })
})

Cypress.Commands.add('postMckinseyCallCompleted', (projectData) => {
    cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
        mckinseyScheduleCallObject.actual_duration = projectData.actual_duration
        mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
        mckinseyScheduleCallObject.projec_name = projectData.project_name
        mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
        mckinseyScheduleCallObject.workstream_name = projectData.workstream_name
        mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
        mckinseyScheduleCallObject.expert_name = projectData.expert_original_name
        mckinseyScheduleCallObject.mck_call_id = projectData.mckinsey_call_id
        mckinseyScheduleCallObject.existingCallStatus = "scheduled"
        mckinseyScheduleCallObject.existingCallId = parseInt(projectData.mckinsey_call_id.replace('mckinsey-', ''))
        mckinseyScheduleCallObject.status = 'completed'

        cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
            expect(requestAvailabilityResponse.status).to.eq(200)

            cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/connect', 10, {
                timeout: 110000,
            }).then(webhookNotification => {
                cy.log(JSON.parse(webhookNotification.body))
                expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/connect')
                expect(webhookNotification.method).to.eq('POST')

                const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
                expect(parsedResponse.call_id).to.eq(projectData.call_id)
            })
        })
    })
})

Cypress.Commands.add('postMckinseyCallCanceled', (projectData) => {
    cy.fixture('objects/mckinseyCallsObject').then(mckinseyScheduleCallObject => {
        mckinseyScheduleCallObject.project_id = projectData.mckinsey_project_id
        mckinseyScheduleCallObject.projec_name = projectData.project_name
        mckinseyScheduleCallObject.workstream_id = projectData.mckinsey_workstream_id
        mckinseyScheduleCallObject.workstream_name = projectData.workstream_name
        mckinseyScheduleCallObject.expert_id = projectData.mckinsey_expert_id
        mckinseyScheduleCallObject.expert_name = projectData.expert_original_name
        mckinseyScheduleCallObject.mck_call_id = projectData.mckinsey_call_id
        mckinseyScheduleCallObject.existingCallStatus = "scheduled"
        mckinseyScheduleCallObject.existingCallId = parseInt(projectData.mckinsey_call_id.replace('mckinsey-', ''))
        mckinseyScheduleCallObject.status = 'canceled'

        cy.requestPostMckinseyCall(mckinseyScheduleCallObject).then(requestAvailabilityResponse => {
            expect(requestAvailabilityResponse.status).to.eq(200)

            cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/connect', 10, {
                timeout: 110000,
            }).then(webhookNotification => {
                cy.log(JSON.parse(webhookNotification.body))
                expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/connect')
                expect(webhookNotification.method).to.eq('POST')

                const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
                expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
                expect(parsedResponse.workstream_id).to.eq(projectData.mckinsey_workstream_id)
                expect(parsedResponse.expert_id).to.eq(projectData.mckinsey_expert_id)
                expect(parsedResponse.call_id).to.eq(projectData.call_id)
            })
        })
    })
})

Cypress.Commands.add('getMckinseyCallCanceled', (projectData) => {
    cy.task('getWebhookNotifications', '/mock-mckinsey-api/calls/cancel', 10, {
        timeout: 110000,
    }).then(webhookNotification => {
        cy.log(JSON.parse(webhookNotification.body))
        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/calls/cancel')
        expect(webhookNotification.method).to.eq('POST')

        const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))
        expect(parsedResponse.call_id).to.eq(projectData.call_id)
    })
})


Cypress.Commands.add('getMckinseyInvoice', (projectData) => {
    cy.task('getWebhookNotifications', '/mock-mckinsey-api/invoice', 10, {
        timeout: 110000,
    }).then(webhookNotification => {
        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/invoice')
        expect(webhookNotification.method).to.eq('POST')

        const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))        
        expect(parsedResponse.invoice_lines[0].project_id).to.eq(projectData.mckinsey_project_id)
        expect(parsedResponse.invoice_lines[0].project_name).to.eq(projectData.project_name)

        expect(btoa(atob(parsedResponse.invoice_header.pdf_link)) === parsedResponse.invoice_header.pdf_link).to.eq(true)
        expect(atob(parsedResponse.invoice_header.pdf_link)).to.include('PDF')
    })
})

Cypress.Commands.add('getMckinseyChatMessages', (projectData) => {
    cy.task('getWebhookNotifications', '/mock-mckinsey-api/chat/messages', 10, {
        timeout: 110000,
    }).then(webhookNotification => {
        cy.log(JSON.parse(webhookNotification.body))
        expect(webhookNotification.path).to.eq('/mock-mckinsey-api/chat/messages')
        expect(webhookNotification.method).to.eq('POST')

        const parsedResponse = JSON.parse(JSON.parse(webhookNotification.body))

        cy.log(parsedResponse)
        expect(parsedResponse.project_id).to.eq(projectData.mckinsey_project_id)
        expect(parsedResponse.text).to.contain(projectData.chat_text)
    })
})

Cypress.Commands.add('postMckinseyExpertReject', (projectData) => {
    cy.fixture('objects/mckinseyExpertObject').then(mckinseyExpertObject => {
        mckinseyExpertObject.project_id = projectData.mckinsey_project_id
        mckinseyExpertObject.project_name = projectData.project_name
        mckinseyExpertObject.workstream_id = projectData.mckinsey_workstream_id
        mckinseyExpertObject.workstream_name = projectData.workstream_name
        mckinseyExpertObject.expert_id = projectData.mckinsey_expert_id
        mckinseyExpertObject.expert_name = projectData.expert_original_name
        mckinseyExpertObject.rejected = projectData.rejected

        cy.requestPostMckinseyExperts(mckinseyExpertObject).then(expertRejectResponse => {
            expect(expertRejectResponse.status).to.eq(200)
        })
    })
})
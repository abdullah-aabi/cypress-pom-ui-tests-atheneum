/* eslint-disable no-loop-func */
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey expert suggests availability from API', { tags: ["mckinsey"] }, function () {
    const projectName = `${generator.generateTestName()} McKinsey project`
    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()

    const expertData = {
        firstName: firstName,
        lastName: lastName,
        originalName: `${firstName} ${lastName}`,
        email: `${firstName + lastName}@mail.com`
    }

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        expert_original_name: expertData.originalName,
        startAt: generator.generateDateAddMinutesLater(30),
        endAt: generator.generateDateAddMinutesLater(90),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData, 'expert_suggests_availability')
    })

    it('should suggest timeslots for the expert, create a new call and reply to ENS', function () {
        cy.intercept('POST', '/api/project/*/pipeline').as('requestPostPipeline')

        cy.checkEPLStatusForCapi(expertData.originalName, 'Expert Suggests Timeslots')

        cy.reload()

        cy.wait('@requestPostPipeline').then(postRequestPipeline =>
            cy.requestGetExpertToEPLAvailability(postRequestPipeline.request.headers.authorization, postRequestPipeline.response.body[0].id).then(expertAvailabilityResponse => {
                expect(expertAvailabilityResponse.body[0].startTime).to.eq(projectData.startAt)
                expect(expertAvailabilityResponse.body[expertAvailabilityResponse.body.length - 1].endTime).to.eq(projectData.endAt)
            }))
    })
})

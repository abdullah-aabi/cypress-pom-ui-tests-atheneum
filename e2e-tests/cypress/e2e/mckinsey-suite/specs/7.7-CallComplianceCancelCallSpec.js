/* eslint-disable no-loop-func */
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Associate scheduling an expert without compliance signed on a Mckinsey project', { tags: "mckinsey" }, function () {
    const projectName = `${generator.generateTestName()} McKinsey project`
    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()

    const expertData = {
        firstName: firstName,
        lastName: lastName,
        originalName: `${firstName} ${lastName}`,
        email: `${firstName + lastName}@mail.com`,
        complianceSigned: false
    }

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        expert_original_name: expertData.originalName,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        startAt: generator.generateDateAddMinutesLater(10),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData, 'schedule')
    })

    it('should schedule the expert 10 minutes later, and cancel the call if the expert compliance is not signed', function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/*/pipeline`).as('requestGetPipeline')

        cy.checkEPLStatusForCapi(expertData.originalName, 'Scheduled')

        cy.wait("@requestGetPipeline").its('response.body').then(pipelineResponse => {
            expect(pipelineResponse[0].eplStatusId).to.equal(9)
        })
    })
})

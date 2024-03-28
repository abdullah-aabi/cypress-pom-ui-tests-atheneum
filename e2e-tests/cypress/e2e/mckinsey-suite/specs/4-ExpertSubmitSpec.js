/* eslint-disable no-loop-func */
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Associate submitting Experts to a Mckinsey Project', { tags: ["mckinsey"] }, function () {
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
        expert_original_name: expertData.originalName,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        fee: random.number(2000),
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData)
    })

    it('should submit an expert to a new Mckinsey project', function () {
        cy.getMckinseyExpertSubmit(projectData).then(mckinseyCallResponse => {
            const parsedResponse = JSON.parse(JSON.parse(mckinseyCallResponse.body))
            projectData.mckinsey_expert_id = parsedResponse.expert_id
        })

        cy.verifyNotificationAndClose()
        cy.checkEPLStatus(expertData.originalName, 'Submitted')
        cy.checkEPLButtonIsDisabled(expertData.originalName)
    })
})
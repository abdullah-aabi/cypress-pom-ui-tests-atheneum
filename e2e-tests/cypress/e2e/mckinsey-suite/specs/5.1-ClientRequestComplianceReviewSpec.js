/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey requesting expert availability and compliance review from API', { tags: "mckinsey" }, function () {
    const projectDetailsPage = new ProjectDetailsPage()
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
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        expert_original_name: expertData.originalName,
        fee: random.number(2000),
        in_compliance_review: true,
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData, 'client_requests_availability')
    })

    it('should request availability for the submitted expert, create chat message and reply to ENS', function () {
        cy.checkEPLStatusForCapi(expertData.originalName, 'Compliance Review')

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('Call Update')

        projectDetailsPage.getProjectCorrespondanceBody()
            .should('contain.text', `Workstream: ${projectData.workstream_name}`)
            .should('contain.text', `Expert: ${expertData.originalName}`)
            .should('contain.text', 'In Compliance Review')
    })
})
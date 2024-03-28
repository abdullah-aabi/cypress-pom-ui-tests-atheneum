/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey requesting expert availability from API', { tags: "mckinsey" }, function () {
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
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData, 'client_requests_availability')
    })

    it('should request availability for the submitted expert, create chat message and reply to ENS', function () {
        cy.checkEPLStatusForCapi(expertData.originalName, 'Client Requests Availability')

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('API New Call')

        projectDetailsPage.getProjectCorrespondanceBody()
            .should('contain.text', `Workstream Name: ${projectData.workstream_name}`)
            .should('contain.text', `Expert Name: ${expertData.originalName}`)
            .should('contain.text', 'Status: Client Requests Availability')
            .should('contain.text', 'Booking URL: Confirm Timeslots')
    })
})

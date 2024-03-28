/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey requesting a follow up call from API', { tags: "mckinsey" }, function () {
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
        expert_original_name: expertData.originalName,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        startAt: generator.generateDateAddMinutesLater(10),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('teamLeader', projectData, expertData, 'completed')
    })

    it('should complete a scheduled call, send a new call request, create a follow up call and reply to ENS', function () {
        cy.checkEPLStatusForCapi(expertData.originalName, 'Interviewed')

        projectData.mckinsey_call_id = generator.generateUniqueIDForClient()

        cy.postMckinseyCallClientRequestsAvailability(projectData).then(requestAvailabilityResponse => {
            const parsedResponse = JSON.parse(JSON.parse(requestAvailabilityResponse.body))
            expect(parsedResponse.call_id).to.eq(projectData.call_id)
            cy.reload()
        })

        projectDetailsPage.getEPLExpertName().should('have.length', 2).each(element => expect(element.text()).to.include(expertData.originalName))

        cy.checkEPLStatus(expertData.originalName, 'Interviewed')
        cy.checkEPLStatus(expertData.originalName, 'Client Requests Availability')
    })
})
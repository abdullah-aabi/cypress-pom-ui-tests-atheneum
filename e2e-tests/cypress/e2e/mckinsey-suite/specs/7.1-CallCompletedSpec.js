/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey completing calls from API', { tags: ["mckinsey"] }, function () {

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
        startAt: generator.generateDateAddMinutesLater(40),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData, 'completed')
    })

    it('should complete a scheduled call, create a call update and reply to ENS', function () {
        cy.checkEPLStatusForCapi(expertData.originalName, 'Interviewed')

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('Call Update')

        projectDetailsPage.getProjectCorrespondanceBodyChat()
            .should('contain.text', `Workstream name: ${projectData.workstream_name}`)
            .should('contain.text', `Projec name: ${projectName}`)
            .should('contain.text', `Expert name: ${expertData.originalName}`)
            .should('contain.text', `Mck call_id: ${projectData.mckinsey_call_id}`)
            .should('contain.text', 'Status: completed')
    })
})

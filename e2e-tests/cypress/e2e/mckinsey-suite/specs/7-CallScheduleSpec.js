/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey scheduling calls from API', { tags: "mckinsey" }, function () {
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
        startAt: generator.generateDateAddMinutesLater(30),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData, 'schedule')
    })

    it('should schedule the timeslot for expert and client, create a new call and reply to ENS', function () {
        cy.checkEPLStatusForCapi(expertData.originalName, 'Scheduled')
        projectDetailsPage.checkEPLScheduledTime(expertData.originalName, generator.convertDateToFormat(projectData.startAt, 'HH:mm'))

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('Call Update')

        projectDetailsPage.getProjectCorrespondanceBodyChat()
            .should('contain.text', `Workstream name: ${projectData.workstream_name}`)
            .should('contain.text', `Projec name: ${projectName}`)
            .should('contain.text', `Expert name: ${expertData.originalName}`)
            .should('contain.text', 'Status: scheduled')
            .should('contain.text', 'Join call_url: https://atheneum.ai')
            .should('contain.text', 'Requested duration: 60')
            .should('contain.text', `Mck call_id: ${projectData.mckinsey_call_id}`)
            .should('contain.text', `Start at: ${projectData.startAt}`)
    })
})

/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('OPS creating a follow up call from platform', { tags: "mckinsey" }, function () {
    const expertPipelinePage = new ExpertPipelinPage()
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
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData, 'completed')
    })

    it('should complete a scheduled call, and create a follow up call and reply to ENS', function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/calls/follow-up`).as('requestCreateFollowUp')

        cy.checkEPLStatusForCapi(expertData.originalName, 'Interviewed')

        expertPipelinePage.clickMckButtonByName('Create Follow Up')

        cy.wait('@requestCreateFollowUp').its('response.statusCode').should('equal', 200)

        projectDetailsPage.getEPLExpertName().should('have.length', 2).each(element => expect(element.text()).to.include(expertData.originalName))

        cy.checkEPLStatus(expertData.originalName, 'Interviewed')
        cy.checkEPLStatus(expertData.originalName, 'Submitted')


    })
})
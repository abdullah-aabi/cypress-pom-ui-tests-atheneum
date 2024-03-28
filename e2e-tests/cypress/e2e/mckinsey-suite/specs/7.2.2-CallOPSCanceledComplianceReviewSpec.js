/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('OPS canceling a Mckinsey call that is in Compliance Review', { tags: "mckinsey" }, function () {
    const expertPipelinePage = new ExpertPipelinePage()
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
        in_compliance_review: true,
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('teamLeader', projectData, expertData, 'client_requests_availability')
    })

    it('should cancel a scheduled call, create a call update and reply to ENS', function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/calls/follow-up`).as('requestCreateFollowUp')
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/calls/cancel`).as('mckCancelRequest')
        cy.checkEPLStatusForCapi(expertData.originalName, 'Compliance Review')

        expertPipelinePage.clickMckButtonByName('Cancel')
        expertPipelinePage.selectCancellationReason('By Expert - No feedback / answer')
        expertPipelinePage.getCancellationConfirmButton().click()

        cy.wait('@mckCancelRequest').its('response.statusCode').should('equal', 200)
        cy.checkEPLStatus(expertData.originalName, 'Platform Canceled')

        expertPipelinePage.clickMckButtonByName('Create Follow Up')
        cy.wait('@requestCreateFollowUp').its('response.statusCode').should('equal', 200)

        projectDetailsPage.getEPLExpertName().should('have.length', 2).each(element => expect(element.text()).to.include(expertData.originalName))

        cy.checkEPLStatus(expertData.originalName, 'Platform Canceled')
        cy.checkEPLStatus(expertData.originalName, 'Submitted')

    })
})

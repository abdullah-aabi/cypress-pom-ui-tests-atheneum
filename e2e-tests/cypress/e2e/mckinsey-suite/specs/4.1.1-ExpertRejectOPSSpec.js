/* eslint-disable no-loop-func */
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe.skip('Associate submitting Experts to a Mckinsey Project', { tags: "mckinsey" }, function () {
    const expertPipelinePage = new ExpertPipelinPage()
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
        rejected: true,
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData)
    })

    it('should check Rejected status is set when OPS rejects the expert', function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/experts/reject`).as('mckRejectRequest')

        cy.checkEPLStatus(expertData.originalName, 'Submitted')

        expertPipelinePage.clickMckButtonByName('Reject Expert')
        expertPipelinePage.getEplStatusConfirmButton().click()

        cy.wait('@mckRejectRequest').its('response.statusCode').should('equal', 200)

        cy.getMckinseyExpertReject(projectData)

        cy.checkEPLStatus(expertData.originalName, 'Expert Rejected')
    })
})
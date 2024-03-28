/* eslint-disable no-loop-func */
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Associate scheduling an expert on a Mckinsey project', { tags: "mckinsey" }, function () {
    const globalPage = new GlobalPage()
    const fasterSchedulingPage = new FasterSchedulingPage()
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
        startAt: generator.generateDateAddMinutesLater(30),
        endAt: generator.generateDateAddMinutesLater(90),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData, 'client_suggests_availability')
        cy.checkEPLStatusForCapi(expertData.originalName, 'Client Suggests Timeslots')
    })

    it('should create a mckinsey call, schedule the expert from the platform and send reply to ENS', function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/calls/schedule`).as('postRequestScheduleCapi')

        expertPipelinePage.clickMckButtonByName('Schedule')
        cy.waitForLoadingDisappear()

        fasterSchedulingPage
            .getConfirmSlotButton()
            .should('be.visible')
            .click()

        cy.wait('@postRequestScheduleCapi').its('response.statusCode').should('eq', 200)

        globalPage.getNotificationTitle()
            .should('contain.text', 'Success!')
        globalPage.getNotificationMessage()
            .should('contain.text', 'Schedule Updated')

        cy.waitForLoadingDisappear()
        cy.checkEPLStatus(expertData.originalName, 'Scheduled')
    })
})

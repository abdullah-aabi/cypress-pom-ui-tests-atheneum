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
        fee: random.number(2000),
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData)
        cy.checkEPLStatusForCapi(expertData.originalName, 'Submitted')
    })

    it('should schedule the expert from the platform and send reply to ENS', function () {
        expertPipelinePage.clickMckButtonByName('Schedule')
        cy.waitForLoadingDisappear()

        fasterSchedulingPage.selectMeetingType('Zoom')

        fasterSchedulingPage
            .getConfirmSlotButton()
            .should('be.visible')
            .click()

        globalPage.getNotificationTitle()
            .should('contain.text', 'Success!')
        globalPage.getNotificationMessage()
            .should('contain.text', 'Schedule Updated')

        cy.waitForLoadingDisappear()
        cy.checkEPLStatus(expertData.originalName, 'Scheduled')
    })
})

/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey clients suggests availability from API', { tags: "mckinsey" }, function () {
    let testUsers;
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
        endAt: generator.generateDateAddMinutesLater(90),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'USD'
    }

    before(function () {
        cy.fixture('testUsers').then(users => testUsers = users)
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData, 'client_suggests_availability')
    })

    it('should suggest timeslots for the client, create a new call and reply to ENS', function () {
        cy.checkEPLStatusForCapi(expertData.originalName, 'Client Suggests Timeslots')

        cy.requestLogIn(
            testUsers.associate.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
        ).then(loginResponse => {
            cy.requestGetClientToProjectAvailability(loginResponse.body.token, projectData.platform_project_id).then(clientAvailabilityResponse => {
                expect(clientAvailabilityResponse.body[0].startTime).to.eq(projectData.startAt)
                expect(clientAvailabilityResponse.body[clientAvailabilityResponse.body.length - 1].endTime).to.eq(projectData.endAt)
            })
        })
        projectDetailsPage.getProjectCorrespondance().click()

        projectDetailsPage.clickProjectCorrespondanceBySubject('API New Call')

        projectDetailsPage.getProjectCorrespondanceBody()
            .should('contain.text', `Workstream Name: ${projectData.workstream_name}`)
            .should('contain.text', `Expert Name: ${expertData.originalName}`)
            .should('contain.text', 'Status: Client Suggests Timeslots')
            .should('contain.text', 'Requested Duration: 60')
    })
})

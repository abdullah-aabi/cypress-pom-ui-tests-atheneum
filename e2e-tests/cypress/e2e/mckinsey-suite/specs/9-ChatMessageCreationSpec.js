/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
const mckinseyChatBody = require('../../../fixtures/objects/mckinseyChat.json')

describe('Creating Mckinsey Chat messages from API', { tags: "mckinsey" }, function () {
    const projectDetailsPage = new ProjectDetailsPage()
    const projectName = `${generator.generateTestName()} McKinsey project`

    let expertData = generator.generateExpertNames(1)[0]

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        fee: 299,
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData)
    })

    it('should create a new Mckinsey project of type Expert Sessions with one workstream and one chat message', function () {
        projectDetailsPage.getProjectName().should('have.text', projectName)

        mckinseyChatBody.project_id = projectData.mckinsey_project_id
        mckinseyChatBody.workstream_id = projectData.mckinsey_workstream_id
        mckinseyChatBody.client_id = projectData.mckinsey_client_id

        cy.requestPostMckinseyChatMessage(mckinseyChatBody)

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('API Conversation Entry')

        projectDetailsPage.getProjectCorrespondanceContactFrom()
            .should('contain.text', mckinseyChatBody.from_email)

        projectDetailsPage.getProjectCorrespondanceContactTo()
            .should('contain.text', 'mckinsey-correspondence@clients.atheneum-app.com')

        projectDetailsPage.getProjectCorrespondanceBodyChat()
            .should('contain.text', mckinseyChatBody.text)

    })
})

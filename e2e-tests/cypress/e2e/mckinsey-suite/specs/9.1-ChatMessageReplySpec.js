/* eslint-disable no-loop-func */
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
const mckinseyChatBody = require('../../../fixtures/objects/mckinseyChat.json')

describe('Creating Mckinsey Chat messages from Correspondence tab', { tags: "mckinsey" }, function () {
    const projectDetailsPage = new ProjectDetailsPage()
    const globalPage = new GlobalPage()
    const projectName = `${generator.generateTestName()} McKinsey project`
    let expertData = generator.generateExpertNames(1)[0]

    const fileNames = ['ExcelTestFile.xlsx', 'JPGTestFile.jpg', 'PDFTestFile.pdf', 'WordTestFile.doc']

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        chat_text: mckinseyChatBody.text,
        fee: 299,
        feeCurrency: 'USD'
    }

    before(function () {
        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData)
    })

    it('should reply to the Mckinsey workstream with a chat message', function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/upload`).as('capiUploadRequest')
        projectDetailsPage.getProjectName().should('have.text', projectName)

        mckinseyChatBody.project_id = projectData.mckinsey_project_id
        mckinseyChatBody.workstream_id = projectData.mckinsey_workstream_id
        mckinseyChatBody.client_id = projectData.mckinsey_client_id

        projectDetailsPage.getProjectCorrespondance().click()
        projectDetailsPage.clickProjectCorrespondanceBySubject('API New Workstream')

        projectDetailsPage.getProjectCorrespondanceReplyButton().click()

        projectDetailsPage.getProjectCorrespondanceBodyTextarea().type(mckinseyChatBody.text)

        fileNames.forEach(file => {
            cy.uploadAttachmentFile(
                `upload_files/${file}`, file
            );
            cy.wait('@capiUploadRequest')
            cy.waitForLoadingDisappear()
        })

        globalPage.getButtonByName('Send').click()

        cy.getMckinseyChatMessages(projectData)

        cy.reload()
        projectDetailsPage.getProjectCorrespondanceSubject(1)
            .should('have.text', 'RE: API New Workstream')
            .click()

        projectDetailsPage.getProjectCorrespondanceBodyChat()
            .should('contain.text', mckinseyChatBody.text)

        projectDetailsPage.getProjectCorrespondanceAttachments().each((attachment, index) => {
            expect(attachment.text()).to.eq(fileNames[index])
        })
    })
})

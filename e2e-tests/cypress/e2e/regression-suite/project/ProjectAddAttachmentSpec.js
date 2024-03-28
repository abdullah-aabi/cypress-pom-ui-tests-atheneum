import generator from '../../../support/generator'
import GlobalPage from '../../../pageObjects/GlobalPage'

describe('Project Attachment Tests', { tags: "regression" }, function () {
    let testUsers, projectId
    const globalPage = new GlobalPage()

    const projectName = `${generator.generateTestName()} Expert Sessions project`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('testUsers').then(testusers => {
                    testUsers = testusers

                    cy.requestLogIn(
                        testUsers.erm.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {

                        cy.setLocalStorageLoginInfo(quickLoginResponse.body.user, quickLoginResponse.body.token)
                        cy.visit(
                            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                        )
                    })
                })
            })
    })

    it('should add a new attachment file of type Excel', function () {
        const excelFileName = 'ExcelTestFile.xlsx'

        globalPage
            .getNoAttachmentsElement()
            .should('have.text', 'No attachments...')

        cy.uploadAttachmentFile(
            `upload_files/${excelFileName}`, excelFileName
        );

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'You have successfully uploaded an attachment.')

        globalPage
            .getAttachmentsWrapper()
            .should('contain.text', excelFileName)
    })

    it('should add a new attachment file of type Word', function () {
        const wordFileName = 'WordTestFile.doc'

        cy.uploadAttachmentFile(
            `upload_files/${wordFileName}`, wordFileName
        );

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'You have successfully uploaded an attachment.')

        globalPage
            .getAttachmentsWrapper()
            .should('contain.text', wordFileName)
    })

    it('should add a new attachment file of type PDF', function () {
        const pdfFileName = 'PDFTestFile.pdf'

        cy.uploadAttachmentFile(
            `upload_files/${pdfFileName}`, pdfFileName
        );

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'You have successfully uploaded an attachment.')

        globalPage
            .getAttachmentsWrapper()
            .should('contain.text', pdfFileName)
    })

    it('should delete the attachment file', function () {
        const excelFileName = 'ExcelTestFile.xlsx'

        globalPage.clickAttachmentDeleteByFilename(excelFileName)
        globalPage.getAttachmentDeleteConfirm().click()

        globalPage
            .getAttachmentsWrapper()
            .should('not.contain.text', excelFileName)
    })
})

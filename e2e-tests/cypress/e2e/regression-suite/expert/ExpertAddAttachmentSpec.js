import generator from '../../../support/generator'
import GlobalPage from '../../../pageObjects/GlobalPage'

describe('Expert Attachment Tests', { tags: "regression" }, function () {
    let testUsers, authToken, localStorage
    let createdExperts = []
    const globalPage = new GlobalPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        let expertsData = generator.generateExpertNames(3)

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
                localStorage = quickLoginResponse.body

                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
            })
        })

        cy.wrap(expertsData).each(expert => {
            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                expertCreateObject.firstName = expert.firstName
                expertCreateObject.lastName = expert.lastName
                expertCreateObject.originalName = expert.originalName
                expertCreateObject.email = expert.email
                cy.requestCreateExpert(authToken, expertCreateObject).then(
                    expertCreateResponse =>
                        createdExperts.push({
                            expertId: expertCreateResponse.body.id,
                            fullName: expertCreateObject.originalName
                        })
                )
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('should add a new attachment file of type Excel', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId}`
        )

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
            .should('have.text', excelFileName)

        globalPage
            .getAttachmentsUploadedBy()
            .should('contain.text', `uploaded by ${testUsers.erm.firstName} ${testUsers.erm.lastName}`)
    })

    it('should add a new attachment file of type Word', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[1].expertId}`
        )

        const wordFileName = 'WordTestFile.doc'

        globalPage
            .getNoAttachmentsElement()
            .should('have.text', 'No attachments...')

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
            .should('have.text', wordFileName)

        globalPage
            .getAttachmentsUploadedBy()
            .should('contain.text', `uploaded by ${testUsers.erm.firstName} ${testUsers.erm.lastName}`)
    })

    it('should add a new attachment file of type PDF', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[2].expertId}`
        )

        const pdfFileName = 'PDFTestFile.pdf'

        globalPage
            .getNoAttachmentsElement()
            .should('have.text', 'No attachments...')

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
            .should('have.text', pdfFileName)

        globalPage
            .getAttachmentsUploadedBy()
            .should('contain.text', `uploaded by ${testUsers.erm.firstName} ${testUsers.erm.lastName}`)
    })

    it('should delete the attachment file', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId}`
        )

        const excelFileName = 'ExcelTestFile.xlsx'

        globalPage
            .getAttachmentsWrapper()
            .should('have.text', excelFileName)

        globalPage.clickAttachmentDeleteByFilename(excelFileName)
        globalPage.getAttachmentDeleteConfirm().click()

        globalPage
            .getNoAttachmentsElement()
            .should('have.text', 'No attachments...')
    })
})

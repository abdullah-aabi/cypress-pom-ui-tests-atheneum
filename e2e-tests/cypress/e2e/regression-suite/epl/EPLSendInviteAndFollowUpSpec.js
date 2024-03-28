import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'

describe('Team Leader sending follow up and invite to experts', { tags: "regression" }, function () {
    let authInfo, projectDetails,
        projectId
    const expertCount = 20

    let expertNamesData = []
    let createdExperts = []

    const projectName = `${generator.generateTestName()} Expert Sessions project`

    const projectDetailsPage = new ProjectDetailsPage()
    const globalPage = new GlobalPage()
    const expertInvitePage = new ExpertInvitePage()
    const expertPipelinePage = new ExpertPipelinePage()

    const generateExpertNames = () => {
        for (let i = 0; i < expertCount; i++) {
            const firstName = generator.generateFirstName()
            const lastName = generator.generateLastName()

            expertNamesData.push({
                firstName: firstName,
                lastName: lastName,
                originalName: `${firstName} ${lastName}`,
                email: `${firstName + lastName}@mail.com`,
                secondEmail: `${firstName + lastName}123@mail.com`,
                newPhone: '+333393999929292',
                company: 'Poindexter Nut Company',
                position: 'Quality Assurance Manager',
                description: 'Responsibilities include food safety, quality assurance, sanitation, customer service, regulatory affairs, R&D, equipment/process validation',
            })
        }
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        generateExpertNames()
        expertNamesData.sort((expertA, expertB) => (expertA.originalName > expertB.originalName) ? 1 : -1)

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('projectDetails').then(testData => projectDetails = testData)
                cy.fixture('testUsers').then(testUsers => {
                    cy.requestLogIn(
                        testUsers.teamLeader.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        authInfo = loginResponse

                        //create experts and add them to the project
                        cy.wrap(expertNamesData).each(expert => {
                            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                                expertCreateObject.firstName = expert.firstName
                                expertCreateObject.lastName = expert.lastName
                                expertCreateObject.originalName = expert.originalName
                                expertCreateObject.email = expert.email
                                cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                                    expertCreateResponse => {
                                        cy.addAndInviteExpertIdToProjectFromAPI(
                                            projectId,
                                            expertCreateResponse.body.id
                                        )

                                        createdExperts.push({
                                            expertId: expertCreateResponse.body.id,
                                            fullName: expertCreateObject.originalName,
                                            emailAddres: expertCreateObject.email
                                        })
                                    }
                                )
                            })
                        })

                    })
                    cy.fixture('projectDetails').then(testData => {
                        projectDetails = testData
                    })
                })
            }
        )
    })

    beforeEach(function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-invite-to-project`).as('bulkInviteToProjectRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/email-experts`).as('emailExpertsRequest')
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
    })

    it('should display an error message if no expert is selected for Send Invite', function () {
        globalPage.getActionButtonByName('Send invite').click()

        globalPage.getNotificationTitle().should('have.text', 'Error!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'You should select an expert first.')
    })

    it('should display an error message if no expert is selected for Send follow up', function () {
        globalPage.getActionButtonByName('Send follow up').click()

        globalPage.getNotificationTitle().should('have.text', 'Error!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'You should select an expert first.')
    })

    it('should select an expert and Send Invite', function () {
        cy.wait(500)
        projectDetailsPage.getSelectAllEPLsCheckbox().click()
        globalPage.getActionButtonByName('Send invite').click()

        expertInvitePage.getSendEmailToField().each((expectedExpertName, index) => {
            expect(expectedExpertName[0].childNodes[0].nodeValue).to.equal(createdExperts[index].fullName)
        })

        expertInvitePage.getSaveButton().click()

        cy.wait('@bulkInviteToProjectRequest')

        expertInvitePage
            .getExpertInvitedMessage()
            .should(
                'contain.text',
                projectDetails.expertsInviteMessageOnPipeline)

        expertInvitePage
            .getInvitedExpertName().then(expertsNames => {
                let expectedExpertList = expertsNames.text()
                    .split(',')
                    .map(expert => expert.trim())
                    .sort((expertA, expertB) => (expertA > expertB) ? 1 : -1)

                expectedExpertList.forEach((expectedExpertName, index) => {
                    expect(expectedExpertName).to.equal(expertNamesData[index].originalName);
                })
            })
            expertPipelinePage.getOkayButton()
            expertPipelinePage.checkEPLCurrentTime(createdExperts[0].fullName, generator.getCurrentTime(), 0)
    })

    it('should select an expert and Send Follow up', function () {
        cy.wait(500)
        projectDetailsPage.getSelectAllEPLsCheckbox().click()
        globalPage.getActionButtonByName('Send follow up').click()

        expertInvitePage.getSendEmailToField().each((expectedExpertName, index) => {
            expect(expectedExpertName.text()).to.contain(createdExperts[index].fullName)
        })

        expertInvitePage.getSaveButton().click()

        cy.wait('@emailExpertsRequest')

        expertInvitePage
            .getExpertInvitedMessage()
            .should(
                'contain.text',
                projectDetails.expertFollowUpMessage)

        expertInvitePage
            .getInvitedExpertName().then(expertsNames => {
                let expectedExpertList = expertsNames.text()
                    .split(',')
                    .map(expert => expert.trim())
                    .sort((expertA, expertB) => (expertA > expertB) ? 1 : -1)

                expectedExpertList.forEach((expectedExpertName, index) => {
                    expect(expectedExpertName).to.equal(expertNamesData[index].originalName);
                })
            })
    })
})

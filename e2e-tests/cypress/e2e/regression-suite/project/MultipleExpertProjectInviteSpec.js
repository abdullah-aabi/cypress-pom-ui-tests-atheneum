import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

// need to change tag once checkboxs to select multiple experts are reintroduced
describe('Associate searching for experts and inviting multiple experts blocked by Sherlock to a project', { tags: "specs_with_issues" }, function () {
    let testUsers,
        projectDetails,
        authToken,
        employeeFullName,
        expertDetails

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertSearchPage = new ExpertSearchPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const expertInvitePage = new ExpertInvitePage()
    const globalPage = new GlobalPage()

    const expertCount = 25

    before(function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('bulkCreateRequest')
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            employeeFullName = `${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName
                }`

            cy.requestLogIn(
                testUsers.associate.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
                cy.setLocalStorageLoginInfo(
                    loginResponse.body.user,
                    loginResponse.body.token
                )

                cy.createProjectFromAPI(projectName, 'Expert Sessions')

                cy.fixture('projectDetails').then(testData => {
                    projectDetails = testData
                })

                cy.fixture('expertDetails').then(testData => {
                    expertDetails = testData
                })

                cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/expert-search')
                globalPage.getClearSearchButton().click()
            })
        })
    })

    it('should invite multiple experts to a project and add a Sherlock comment for all', function () {
        expertSearchPage
            .getExpertNameField()
            .type(`${expertDetails.blockedExpertName}{enter}`)

        expertSearchRequestBody.expertData = expertDetails.blockedExpertName

        cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
            expertSearchResult => {
                expertSearchPage.checkExpertResultsAndTotalField(expertSearchResult)

                expertSearchPage.getSelectAllExpertsCheckbox().click()

                expertSearchPage.getExpertsSelectedTotal().should('contain.text', `${expertCount} of ${expertCount} selected`)

                expertSearchPage.getAddInviteSelectedExperts().click()

                expertInvitePage.selectProjectField(projectName)
                cy.waitForLoadingDisappear()
                expertInvitePage.selectExpertSegmentField()

                expertInvitePage.getExpertSherlockWarning().should('contain.text', expertDetails.sherlockMultiExpertInviteMessage)
                expertInvitePage.getExpertSherlockWriteCommentButton().click()
                expertInvitePage.getExpertSherlockChooseAllButton().click()

                expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment)
                expertInvitePage.getExpertSherlockCommentOkButton().click()

                cy.clickInviteActionButton('Add and invite')
                cy.waitForLoadingDisappear()

                expertInvitePage
                    .getNumberOfExpertField()

                projectDetailsPage
                    .getScreeningTextAreaList()
                    .first()
                    .contains(projectDetails.screeningDefaultQuestion)
                projectDetailsPage
                    .getScreeningTextAreaList()
                    .last()
                    .contains(projectDetails.screeningQuestion2)

                expertInvitePage.selectAssignedAssociatesField(employeeFullName)
                expertInvitePage.getSaveButton().click()
                cy.waitForLoadingDisappear()

                expertInvitePage
                    .getSendEmailSenderField()
                    .should('have.text', employeeFullName)

                expertInvitePage.getSaveButton().click()


                cy.wait(['@bulkCreateRequest', '@bulkCreateRequest', '@bulkCreateRequest'])

                cy.get('@bulkCreateRequest.all').should('have.length', 3)

                expertInvitePage
                    .getExpertInvitedMessage()
                    .should(
                        'have.text',
                        `${projectDetails.expertsInviteMessageFirstPart} "${projectName}"`
                    )

                expertInvitePage
                    .getInvitedExpertName().then(expertsNames => {
                        let expectedExpertList = expertsNames.text()
                            .split(',')
                            .map(expert => expert.trim())

                        expect(expectedExpertList.length).to.equal(25);
                    })
                cy.wait(2000)
                globalPage.getNotificationMessage().first().should('have.text',
                    `25 ${projectDetails.notificationForExpertAddedtoProject} ${projectName} out of 25`)

                expertInvitePage.goToProjectButton().click()

                projectDetailsPage.getProjectPipeline().click()

                projectDetailsPage.getEPLStatus().should('have.length', 25).each(expertStatus =>
                    expect(expertStatus.text().trim()).to.equal('Invited')
                )
            }
        )
    })
})

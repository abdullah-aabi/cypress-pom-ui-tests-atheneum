import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'

describe('Associate copying EPLs, searching for suggested experts', { tags: "regression" }, function () {
    let authInfo, projectDetails,
        projectId, employeeFullName, projectIdCopy

    const projectName = `${generator.generateTestName()} Expert Sessions project`

    const projectDetailsPage = new ProjectDetailsPage()
    const globalPage = new GlobalPage()
    const expertInvitePage = new ExpertInvitePage()
    const expertPipelinePage = new ExpertPipelinPage()

    const copyProjectName = `${generator.generateTestName()} Expert Sessions project copy`

    let expertsData = generator.generateExpertNames(2)

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.createProjectFromAPI(copyProjectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectIdCopy = projectCreateResponse.body.id})

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('projectDetails').then(testData => projectDetails = testData)
                cy.fixture('testUsers').then(testUsers => {
                    employeeFullName = `${testUsers.associate.firstName} ${testUsers.associate.lastName
                        }`

                    cy.requestLogIn(
                        testUsers.associate.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        authInfo = loginResponse
                    })

                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        cy.wrap(expertsData).each((expert, index) => {
                            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                                expertCreateObject.firstName = expert.firstName
                                expertCreateObject.lastName = expert.lastName
                                expertCreateObject.originalName = expert.originalName
                                expertCreateObject.email = expert.email
                                cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                                    expertCreateResponse => {
                                        expertsData[index].expertId = expertCreateResponse.body.id
                                        expertsData[index].fullName = expertCreateObject.originalName
                                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
                                    })
                            })
                        })
                    })
                })
            }
        )
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
        cy.intercept('GET', '**/pipeline/filters').as('getProjectFilters')
    })

    it('should be able to Search for suggested experts if there are epls with status Submitted', function () {
        globalPage.getActionButtonByName('Suggested Experts').click()

        globalPage.getPopupTitle().should('have.text', projectDetails.noExpertsFoundTitle)
        globalPage.getPopupContent().should('contain.text', projectDetails.noExpertsFoundMessage)
    })

    it('should display suggested experts for the current epl', function () {

        cy.wait(500)
        cy.changeEPLStatus(expertsData[0].fullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(expertsData[0].fullName, 'Submitted')

        globalPage.getActionButtonByName('Suggested Experts').click()

        cy.url().should('eq', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)

        // globalPage.getFilterCriteriaSelected().should('contain.text', expertsData[0].fullName)
    })

    it('should copy the expert to another project', function () {
        cy.wait(500)
        projectDetailsPage.getEPLCheckbox().click()
        globalPage.getActionButtonByName('Copy experts').click()

        expertInvitePage.selectProjectField(copyProjectName)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        cy.clickInviteActionButton('Copy only')
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        cy.wait(4000)
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectIdCopy
            }`
        )
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectPipeline().click()
        cy.wait('@getProjectFilters').its('response.statusCode').should('equal', 200)
        cy.waitForLoadingDisappear()
        cy.verifyExpertReplyStatus(expertsData[0].fullName, 'Not contacted')
    })

    it('should copy and invite expert to another project', function () {
        cy.wait(500)
        cy.changeEPLStatus(expertsData[1].fullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(expertsData[1].fullName, 'Submitted')
        projectDetailsPage.getEPLCheckbox(3).click()
        globalPage.getActionButtonByName('Copy experts').click()

        expertInvitePage.selectProjectField(copyProjectName)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        cy.clickInviteActionButton('Copy and invite')
        cy.waitForLoadingDisappear()

        expertInvitePage
            .getNumberOfExpertField()
            .should('have.attr', 'value', projectDetails.noOfExperts)
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
        expertInvitePage.getSendEmailToField().contains(expertsData[1].fullName)
        expertInvitePage.getSaveButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        cy.wait(4000)
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectIdCopy
            }`
        )
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectPipeline().click()
        cy.wait('@getProjectFilters').its('response.statusCode').should('equal', 200)
        cy.waitForLoadingDisappear()
        cy.verifyExpertReplyStatus(expertsData[1].fullName, 'Invited')
    })
})

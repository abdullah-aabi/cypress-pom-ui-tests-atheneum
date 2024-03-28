import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import EYComplianceReviewPage from '../../../pageObjects/EYComplianceReviewPage'

describe('EY Compliance', { tags: "regression" }, function () {
    let localStorage, users, projectId, authToken
    let createdExperts = []
    let expertNamesData = []
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const expertPipelinePage = new ExpertPipelinPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const eyComplianceReviewPage = new EYComplianceReviewPage()
    const generateExpertNames = () => {
        for (let i = 0; i <= 3; i++) {
            const firstName = generator.generateFirstName()
            const lastName = generator.generateLastName()
            expertNamesData.push({
                firstName: firstName,
                lastName: lastName,
                originalName: `${firstName} ${lastName}`,
                email: `${firstName + lastName}@mail.com`
            })
        }
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        generateExpertNames()
        cy.fixture('testData').then(testData => {
            cy.fixture('testUsers').then(testUsers => {
                users = testUsers
                cy.requestLogIn(
                    testUsers.accountManager.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    authToken = quickLoginResponse.body.token
                    localStorage = quickLoginResponse.body
                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                    cy.wrap(expertNamesData).each(expert => {
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

                cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.EYOfficeName).then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        for (let i = 0; i <= 3; i++) {
                            cy.addAndInviteExpertIdToProjectFromAPI(projectId, createdExperts[i].expertId)
                        }
                        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
                    })
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('Should check External compliance under project details', function () {
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectDetailsRowValueByName('Client office')
            .should('have.text', 'Ernst & Young Berlin')
        projectDetailsPage.getProjectDetailsRowValueByName('Client account')
            .should('have.text', 'Ernst & Young Germany')
        projectDetailsPage.getComplianceStatus()
            .should('have.text', 'Required')
    })

    it('Should change EPL Status to Submitted', function () {
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        cy.changeEPLStatus(createdExperts[0].fullName, 'Submitted')
        //fill options as no yes
        eyComplianceReviewPage.getExpertComplianceButton(1).click()
        eyComplianceReviewPage.getSelectionOption(2).click()
        eyComplianceReviewPage.getExpertComplianceButton(2).click()
        eyComplianceReviewPage.getSelectionOption(1).click()
        eyComplianceReviewPage.getSaveBtn().click()
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(createdExperts[0].fullName, 'Submitted')
    })

    it('Should change EPL Status to Rejected', function () {
        cy.changeEPLStatus(createdExperts[1].fullName, 'Submitted')
        //fill options as yes no
        eyComplianceReviewPage.getExpertComplianceButton(1).click()
        eyComplianceReviewPage.getSelectionOption(1).click()
        eyComplianceReviewPage.getExpertComplianceButton(2).click()
        eyComplianceReviewPage.getSelectionOption(2).click()
        eyComplianceReviewPage.getSaveBtn().click()
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(createdExperts[1].fullName, 'Rejected')
    })

    it('Should change EPL Status to compliance audit', function () {
        cy.changeEPLStatus(createdExperts[2].fullName, 'Submitted')
        //fill options as yes yes
        eyComplianceReviewPage.getExpertComplianceButton(1).click()
        eyComplianceReviewPage.getSelectionOption(1).click()
        eyComplianceReviewPage.getExpertComplianceButton(2).click()
        eyComplianceReviewPage.getSelectionOption(1).click()
        eyComplianceReviewPage.getSaveBtn().click()
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(createdExperts[2].fullName, 'Compliance audit')
    })

    it('Should change EPL Status to Rejected', function () {
        cy.changeEPLStatus(createdExperts[3].fullName, 'Submitted')
        //fill options as no no
        eyComplianceReviewPage.getExpertComplianceButton(1).click()
        eyComplianceReviewPage.getSelectionOption(2).click()
        eyComplianceReviewPage.getExpertComplianceButton(2).click()
        eyComplianceReviewPage.getSelectionOption(2).click()
        eyComplianceReviewPage.getSaveBtn().click()
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(createdExperts[3].fullName, 'Rejected')
    })
})
/// <reference types="Cypress" />
import ClientCreateProjectPage from '../../../pageObjects/ClientCreateProjectPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
const ProjectTypes = require('../../../fixtures/projectTypes.json')

describe('Client Create Project', { tags: "specs_not_yet_released" }, function () {
    let accountId, localStorage, localStorageClient, authToken, authTokenClient, testUsers, projectData

    const projectDetailsPage = new ProjectDetailsPage()
    const clientCreateProjectPage = new ClientCreateProjectPage()
    const globalPage = new GlobalPage()
    const projectName = `${generator.generateTestName()} Client project`
    const projectNames = `${generator.generateTestName()} Client projects`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.accountManager.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                localStorage = loginResponse.body.user
                authToken = loginResponse.body.token

            })
            cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'))
            cy.requestClientsLogin(
                testusers.avenComplianceAuditor.emailAddress,
                Cypress.env('CYPRESS_EXTERNAL_PASSWORD'))
                .then(loginResponse => {
                    localStorageClient = loginResponse.body.user
                    authTokenClient = loginResponse.body.token
                })

        })
        cy.fixture('clientProjectData').then((clientProjectData) => {
            projectData = clientProjectData
        })
    })

    beforeEach(function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/platform-client-projects`).as('clientCreateProject')
    })

    it('Should create a new project', function () {
        cy.setLocalStorageLoginInfo(
            localStorageClient,
            authTokenClient,
            "client"
        )
        cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'))
        clientCreateProjectPage.getCreateProject().click()
        clientCreateProjectPage.getEnterProjectName().type(projectName)
        clientCreateProjectPage.getProjectType(2)
        clientCreateProjectPage.getProjectBrief(projectData.projectBrief)
        globalPage.getButtonByName('Next').click()

        //add project director and charge code
        clientCreateProjectPage.getPDNameInput().type(projectData.projectDirectorName)
        clientCreateProjectPage.getPDEmailInput().type(projectData.projectDirectorEmail)
        clientCreateProjectPage.getPDPhoneNumberInput().type(projectData.projectDirectorPhone)

        clientCreateProjectPage.getPLNameInput().type(projectData.projectLeadName)
        clientCreateProjectPage.getPLEmailInput().type(projectData.projectLeadEmail)
        clientCreateProjectPage.getPLPhoneNumberInput().type(projectData.projectLeadPhone)

        clientCreateProjectPage.getChargeCodeInput().type(projectData.chargeCode)

        globalPage.getButtonByName('Next').click()

        clientCreateProjectPage.getIndustry(projectData.industry)

        // Experience level
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Experience level').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Experience level').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.experienceLevel).click()

        // Expert language
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Expert language').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Expert language').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.expertLanguage).click()

        // Expert location
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Expert location').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Expert location').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.expertLocation).click()

        // Expert count
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Expert count').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Expert count').type(projectData.expertCount)

        // Profession and role
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Profession').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Profession').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.profession).click()

        clientCreateProjectPage.getProjectDetailsSelectByName('Role').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.role).click()

        // Companies to add
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Companies to add').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Companies to add').type(`${projectData.companiesToAdd}{enter}`)
        clientCreateProjectPage.getProjectDetailsSelectByName('Company size').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.companySize).click()

        // Companies to exclude
        clientCreateProjectPage.getProjectDetailsCheckBoxByName('Companies to exclude').click()
        clientCreateProjectPage.getProjectDetailsSelectByName('Companies to exclude').type(`${projectData.companiesToExclude}{enter}`)

        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getCreateScope(projectData.scopeName, projectData.industry)
        globalPage.getButtonByName('Save').click()
        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getAddNewQuestion(projectData.question)
        globalPage.getButtonByName('Create').click()

        cy.wait('@clientCreateProject').its('response.body').should('eq', "open")
        globalPage.getNotificationMessage().should('contain.text', 'You created a new project.')
    })

    it('Should Verify newly created project', function () {
        cy.setLocalStorageLoginInfo(
            localStorage,
            authToken
        )
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/project-management')
        clientCreateProjectPage.getProjectTitle(projectName).click()

        clientCreateProjectPage.getVerifyProjectBackground(0).should('be.visible').should('contain.text', projectData.projectBrief)
        clientCreateProjectPage.getVerifyProjectIndustry(1).should('have.text', `Competitors: ${projectData.companiesToExclude}`)
        clientCreateProjectPage.getVerifyProjectIndustry(2).should('have.text', `Companies: ${projectData.companiesToAdd}`)
        clientCreateProjectPage.getVerifyProjectIndustry(3).should('have.text', `Company Size: ${projectData.companySize}`)
        clientCreateProjectPage.getVerifyProjectIndustry(4).should('have.text', `Industries: ${projectData.industry}`)
        clientCreateProjectPage.getVerifyProjectIndustry(5).should('have.text', `Languages: ${projectData.expertLanguage}`)
        clientCreateProjectPage.getVerifyProjectIndustry(6).should('have.text', `Geographies: ${projectData.expertLocation}`)
        clientCreateProjectPage.getVerifyProjectIndustry(7).should('have.text', `Seniority: ${projectData.experienceLevel}`)
        clientCreateProjectPage.getVerifyProjectIndustry(8).should('have.text', `Professions: ${projectData.profession}`)
        clientCreateProjectPage.getVerifyProjectIndustry(9).should('have.text', `Roles: ${projectData.role}`)
        clientCreateProjectPage.getVerifyProjectIndustry(10).should('have.text', `Timezone: ${projectData.defaultTimezone}`)

        clientCreateProjectPage.getVerifyInitialScope().should('have.attr', 'value', 'Initial scope')
        clientCreateProjectPage.getVerifyInitialQuestion().should('have.text', projectData.question)
        clientCreateProjectPage.getCloseSegmentPopup().click()
        clientCreateProjectPage.getVerifyScopeName().should('contain.text', projectData.scopeName)

        projectDetailsPage.getProjectDetailsValueByRowName('Type').should('have.text', 'Expert-backed Research')
        projectDetailsPage.getProjectDetailsValueByRowName('Case code').should('have.text', projectData.chargeCode)
        projectDetailsPage.getProjectDetailsValueByRowName('Project lead name').should('have.text', projectData.projectLeadName)
        projectDetailsPage.getProjectDetailsValueByRowName('Project director name').should('have.text', projectData.projectDirectorName)
        projectDetailsPage.getProjectDetailsValueByRowName('Project director email').should('have.text', projectData.projectDirectorEmail)

        projectDetailsPage.getProjectRequiredInterviews().should('have.text', 24)
    })

    it('Should create a new draft project', function () {
        cy.setLocalStorageLoginInfo(
            localStorageClient,
            authTokenClient,
            "client"
        )
        clientCreateProjectPage.getCreateProject().click()
        clientCreateProjectPage.getEnterProjectName().type(projectName)
        clientCreateProjectPage.getProjectType(2)
        clientCreateProjectPage.getProjectBrief(projectData.projectBrief)
        globalPage.getButtonByName('Next').click()
        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getIndustry(projectData.industry)
        globalPage.getButtonByName('Cancel').click()
        clientCreateProjectPage.getExitAndDraft('Exit and save my project as draft').click()
        globalPage.getNotificationMessage().should('contain.text', 'Your project is saved as draft.')

        // Removed for now
        // clientCreateProjectPage.getSeeFilter().click()
        // clientCreateProjectPage.getFilter('Draft').click()

        cy.requestGetClientProjectsDraftORPending(authTokenClient).then(
            clientProjectResponse => {
                const draftProject = clientProjectResponse.body.pop()
                expect(draftProject.client_project_name).to.eql(projectName)
                expect(draftProject.status).to.eql('draft')

            })
    })

    it('Should Verify newly created draft project', function () {
        cy.setLocalStorageLoginInfo(
            localStorage,
            authToken
        )
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-projects')

        cy.requestGetClientProjectsInPlatform(authToken).then(
            clientProjectResponse => {
                const draftProject = clientProjectResponse.body.pop()
                expect(draftProject.client_project_name).to.eql(projectName)
                expect(draftProject.status).to.eql('draft')
            })
    })

    it('Should create a pending project if theres no client office for the selected timezone', function () {
        cy.setLocalStorageLoginInfo(
            localStorageClient,
            authTokenClient,
            "client"
        )
        cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'))
        clientCreateProjectPage.getCreateProject().click()
        clientCreateProjectPage.getEnterProjectName().type(projectName)
        clientCreateProjectPage.getProjectType(2)
        clientCreateProjectPage.getProjectBrief(projectData.projectBrief)
        globalPage.getButtonByName('Next').click()

        // set Timezone where client doesnt have office
        clientCreateProjectPage.getProjectDetailsSelectByName('Timezone').click()
        clientCreateProjectPage.getAutocompleteSelection().contains(projectData.timezone).click()

        clientCreateProjectPage.getChargeCodeInput().type(projectData.chargeCode)

        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getIndustry(projectData.industry)

        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getCreateScope(projectData.scopeName, projectData.industry)
        globalPage.getButtonByName('Save').click()
        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getAddNewQuestion(projectData.question)
        globalPage.getButtonByName('Create').click()

        cy.wait('@clientCreateProject').its('response.body').should('eq', "pending")
        globalPage.getNotificationMessage().should('contain.text', 'Your project is saved as pending. Our associate will create it for you.')
    })

    it('Should create a new pending project when clicking Create for me', function () {
        cy.setLocalStorageLoginInfo(
            localStorageClient,
            authTokenClient,
            "client"
        )
        clientCreateProjectPage.getCreateProject().click()
        clientCreateProjectPage.getEnterProjectName().type(projectName)
        clientCreateProjectPage.getProjectType(2)
        clientCreateProjectPage.getProjectBrief(projectData.projectBrief)
        globalPage.getButtonByName('Next').click()
        globalPage.getButtonByName('Next').click()
        clientCreateProjectPage.getIndustry(projectData.industry)
        globalPage.getButtonByName('Cancel').click()
        clientCreateProjectPage.getExitAndDraft('Create it for me').click()
        globalPage.getNotificationMessage().should('contain.text', 'Your project is saved as pending.')

        // Removed for now
        // clientCreateProjectPage.getSeeFilter().click()
        // clientCreateProjectPage.getFilter('Pending').click()

        cy.requestGetClientProjectsDraftORPending(authTokenClient).then(
            clientProjectResponse => {
                const PendingProject = clientProjectResponse.body.pop()
                expect(PendingProject.client_project_name).to.eql(projectName)
                expect(PendingProject.status).to.eql('pending')
            })
    })

    it('Should Verify newly created pending project', function () {
        cy.setLocalStorageLoginInfo(
            localStorage,
            authToken
        )
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/client-projects')

        cy.requestGetClientProjectsInPlatform(authToken).then(
            clientProjectResponse => {
                const draftProject = clientProjectResponse.body.pop()
                expect(draftProject.client_project_name).to.eql(projectName)
                expect(draftProject.status).to.eql('pending')
            })
    })

    ProjectTypes.forEach((projectType, index) => {
        it(`should create a new project of type ${projectType} through API`, function () {
            const projectAPIName = `${projectNames} ${projectType}`
            cy.fixture('objects/clientSearchObject').then(clientSearchObject => {
                clientSearchObject.q = projectData.clientName
                cy.requestSearchClient(authToken, clientSearchObject).then(
                    clientSearchObject => {
                        accountId = clientSearchObject.body.hits.hits[0]._source.accounts[0].offices[0].accountId

                        cy.fixture('objects/clientCreateProjectObject').then(clientCreateProjectObject => {
                            clientCreateProjectObject.projectName = projectAPIName
                            clientCreateProjectObject.projectTypeId = index + 1
                            clientCreateProjectObject.platformClientId = accountId

                            // client create project via API
                            cy.requestClientCreateProject(authTokenClient, clientCreateProjectObject).then(
                                clientCreateProjeceResponse => {
                                    expect(clientCreateProjeceResponse.body).to.eql('open')
                                })

                            // check created project from hash
                            cy.requestGetClientProjectsOngoing(authTokenClient).then(
                                clientProjectResponse => {
                                    const projectHash = clientProjectResponse.body.filter(project =>
                                        project.projectName === projectAPIName)[0].hash

                                    cy.requestGetAPICreatedProjects(projectHash).then(
                                        clientProjectResponse => {
                                            const projectBody = clientProjectResponse.body
                                            expect(projectBody.hash).to.eql(projectHash)
                                            expect(projectBody.projectTypeId).to.eql(1 + index)
                                            expect(projectBody.projectName).to.eql(projectAPIName)
                                            expect(projectBody.projectDirectorName).to.eql(clientCreateProjectObject.projectDirectorName)
                                            expect(projectBody.projectDirectorEmail).to.eql(clientCreateProjectObject.projectDirectorEmail)
                                            expect(projectBody.projectLeadName).to.eql(clientCreateProjectObject.projectLeadName)
                                            expect(projectBody.projectLeadEmail).to.eql(clientCreateProjectObject.projectLeadEmail)

                                            expect(projectBody.segments.length).to.eql(clientCreateProjectObject.segments.length)
                                            projectBody.segments.forEach((segment, index) => {
                                                expect(segment.name).to.eql(clientCreateProjectObject.segments[index].segmentName)
                                                expect(segment.numberOfExpert).to.eql(clientCreateProjectObject.segments[index].requestedNumberOfCalls)
                                                expect(segment.screeningQuestions.length).to.eql(clientCreateProjectObject.segments[index].screeningQuestions.length)
                                            })
                                        })
                                })
                        })
                    })
            })
        })
    })
})


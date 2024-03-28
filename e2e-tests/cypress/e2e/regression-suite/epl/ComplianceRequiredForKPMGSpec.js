/// <reference types="Cypress" />
import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ClientCreateProjectPage from '../../../pageObjects/ClientCreateProjectPage'
import ClientsAppPage from '../../../pageObjects/ClientsAppPage'

describe('KPMG Compliance', { tags: "regression" }, function () {
    let localStorage, users, projectId, authToken, clientProjectLink, authTokenClient, localStorageClient
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const expertPipelinePage = new ExpertPipelinPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const clientCreateProjectPage = new ClientCreateProjectPage()
    const clientsAppPage = new ClientsAppPage()
    let expertsData = generator.generateExpertNames(2)

    before(function () {

        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.fixture('testData').then(testData => {
            cy.fixture('testUsers').then(testUsers => {
                users = testUsers
                cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.KPMGOfficeName).then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        cy.requestLogIn(
                            testUsers.accountManager.emailAddress,
                            Cypress.env('CYPRESS_USER_PASSWORD')
                        ).then(quickLoginResponse => {
                            localStorage = quickLoginResponse.body
                            authToken = quickLoginResponse.body.token
                            cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

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

                            cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'))
                            cy.requestClientsLogin(
                                users.kpmgComplianceAuditor.emailAddress,
                                Cypress.env('CYPRESS_EXTERNAL_PASSWORD'))
                                .then(loginResponse => {
                                    localStorageClient = loginResponse.body.user
                                    authTokenClient = loginResponse.body.token
                                })
                            cy.visit(
                                `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
                            )
                            cy.requestClientsGetProjectLink(authToken, projectId).then(
                                projectLinkResponse => {
                                    clientProjectLink = projectLinkResponse.body.externLink
                                })
                        })
                    })
            })
        })


    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('POST', `${Cypress.env('CLIENTS_PLATFORM_APP_URL')}/api/metrics`).as('save');
    })

    it('Should check External compliance under project details', function () {
        cy.waitForLoadingDisappear()
        projectDetailsPage.getProjectDetailsRowValueByName('Client office')
            .should('have.text', 'KPMG Berlin')
        projectDetailsPage.getProjectDetailsRowValueByName('Client account')
            .should('have.text', 'KPMG Germany')
        projectDetailsPage.getComplianceStatus()
            .should('have.text', 'Required')
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        cy.changeEPLStatus(expertsData[0].fullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(expertsData[0].fullName, 'Compliance audit')
        projectDetailsPage.getComplianceAuditFilter()
            .should('contain.text', 'Compliance audit')
    })

    it('Should rejected by compliance auditor', function () {
        cy.setLocalStorageLoginInfo(
            localStorageClient,
            authTokenClient,
            "client"
        )
        cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'))
        clientCreateProjectPage.getAuditTab().click()
        clientCreateProjectPage.getEngagementManager(0).type('Test Automation')
        clientCreateProjectPage.getEngagementCode(0).type('Test Automation')
        clientCreateProjectPage.getclientComments(0).type('Test Automation')
        clientCreateProjectPage.getButtonNotRelevant(0).click()
        clientCreateProjectPage.getYesButton().click()
        cy.wait('@save')
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
        )
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        projectDetailsPage.getVerifyEPLStatus().eq(1).then(EPLValue => {
            expect(EPLValue.text()).to.eql("Rejected")
        })

        projectDetailsPage.getRejectMouseOver().trigger('mouseover')
        projectDetailsPage.getToolTipText().then(tooltip => {
            expect(tooltip.text()).to.eql("Expert has been rejected by Compliance auditor John Wick: Test Automation")
        })
        cy.visit(clientProjectLink)
        clientCreateProjectPage.getSegmentLink().click()
        clientCreateProjectPage.getExpertName().then(Expertname => {
            expect(Expertname.text()).to.eql(expertsData[0].fullName)
        })
    })

    it('Should accepted by compliance auditor', function () {
        cy.setLocalStorageLoginInfo(
            localStorageClient,
            authTokenClient,
            "client"
        )

        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
        )
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()

        cy.changeEPLStatus(expertsData[1].fullName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.checkEPLStatus(expertsData[1].fullName, 'Compliance audit')

        cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'))
        clientCreateProjectPage.getAuditTab().click()
        clientCreateProjectPage.getEngagementManager(0).type('Test Automation')
        clientCreateProjectPage.getEngagementCode(0).type('Test Automation')
        clientCreateProjectPage.getclientComments(0).type('Test Automation')
        clientCreateProjectPage.getButtonApprove('Approve profile', 0).click()
        clientCreateProjectPage.getYesButton().click()
        cy.wait('@save')
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
        )
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        projectDetailsPage.getVerifyEPLStatus().eq(0).then(EPLValue => {
            expect(EPLValue.text()).to.eql("Submitted")
        })

        projectDetailsPage.getAccepttMouseOver().trigger('mouseover')
        projectDetailsPage.getToolTipText().eq(0).then(tooltip => {
            expect(tooltip.text()).to.eql("Expert has been accepted by Compliance auditor John Wick: Test Automation")
        })
        cy.visit(clientProjectLink)
        clientCreateProjectPage.getExpertName().then(Expertname => {
            expect(Expertname.text()).to.eql(expertsData[1].fullName)
        })
    })

    it('Should request and schedule for KPMG', function () {

        clientsAppPage.getRequestSchedulingButton().click()
        clientsAppPage.getTimeSlotAvaialability()

        clientsAppPage.getSubmitButton().contains('Add availability').should('be.enabled').click()
        clientsAppPage.getSubmitButton().contains('Request').should('be.enabled').click()

        clientsAppPage.getPopupTitle().should('have.text', 'Scheduling requested')
        clientsAppPage.getSubmitButton().contains('OK').should('be.enabled').click()
        cy.waitForLoadingDisappear()
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        clientsAppPage.getExpertCode().contains(`EX-${expertsData[1].expertId}`).parentsUntil('div.single--green')
            .within(() => {
                expertInvitePage.getEPLStatusDropdown().should('have.text', 'Requested')
                expertPipelinePage.getSchedulingButton().should('be.visible').click()

            })

        cy.waitForLoadingDisappear()
        expertPipelinePage.getSchedulingTitle().should('contain.text', 'Scheduling')
        expertPipelinePage.getCloseButton().click()
        clientsAppPage.getExpertCode().contains(`EX-${expertsData[1].expertId}`).parentsUntil('div.single--green')
            .within(() => {
                expertInvitePage.getEPLStatusDropdown().should('have.text', 'Requested').click()
                expertPipelinePage.getEplList().contains('Scheduled').should('be.visible').click()
            })

        // Need to uncomment when AP-4805 is resolved
        // cy.waitForLoadingDisappear()
        // expertPipelinePage.getSchedulingTitle().should('contain.text', 'Scheduling')
    })
})
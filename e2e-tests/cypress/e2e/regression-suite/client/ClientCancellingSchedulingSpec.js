import ClientsAppPage from '../../../pageObjects/ClientsAppPage'
import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'

describe('Client cancelling a scheduled expert meeting request', { tags: "regression" }, function () {
    let localStorageAssociate, testUsers, projectId, clientProjectLink, expertQuickLoginLink
    const projectName = `${generator.generateTestName()} Expert Sessions project`

    let expertData = generator.generateExpertNames(1)[0]

    const clientsAppPage = new ClientsAppPage()
    const expertsAppPage = new ExpertsAppPage()
    const expertPipelinePage = new ExpertPipelinPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                cy.fixture('testUsers').then(testusers => {
                    testUsers = testusers

                    cy.requestLogIn(
                        testusers.associate.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        localStorageAssociate = loginResponse.body
                    })

                    cy.requestLogIn(
                        testUsers.teamLeader.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {

                        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                            expertCreateObject.firstName = expertData.firstName
                            expertCreateObject.lastName = expertData.lastName
                            expertCreateObject.originalName = expertData.originalName
                            expertCreateObject.email = expertData.email
                            cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                                expertCreateResponse => {
                                    expertData.id = expertCreateResponse.body.id
                                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
                                    cy.requestLoginAsExpertById(expertData.id).then(
                                        expertQuickLoginResponse => {
                                            expertQuickLoginLink = expertQuickLoginResponse.body.link

                                            cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)
                                        })
                                }
                            )
                        })

                    })

                    cy.requestClientsLogin(testusers.avenComplianceAuditor.emailAddress, Cypress.env('CYPRESS_EXTERNAL_PASSWORD')).then(
                        loginResponse => cy.requestClientsGetProjectExternLink(loginResponse.body.token, projectId).then(
                            projectLinkResponse => {
                                clientProjectLink = projectLinkResponse.body.externLink
                            }
                        )
                    )
                })
            }
        )
    })

    it('expert should check Experts page that the EPL status is Invited', function () {
        cy.visit(expertQuickLoginLink)

        expertsAppPage.getExpertConfirmInputFieldByName('Email').should('have.attr', 'value', expertData.email)
        expertsAppPage.getComplianceButton('Confirm').click()

        expertsAppPage.getComplianceHeader().should('not.exist')

        expertsAppPage.getConsultationCardTitleInvitations().should('contain', projectName)

    })

    it('associate should change EPL status from Submitted to Requested', function () {
        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)

        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        cy.changeEPLStatus(expertData.originalName, 'Submitted')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.verifyNotificationAndClose()
        cy.checkEPLStatus(expertData.originalName, 'Submitted')
        cy.changeEPLStatus(expertData.originalName, 'Requested')
        expertPipelinePage.getEplStatusConfirmButton().click()
        cy.verifyNotificationAndClose()
        cy.checkEPLStatus(expertData.originalName, 'Requested')
    })

    it('client should cancel the EPL request', function () {
        cy.visit(clientProjectLink)
        clientsAppPage.getExpertName().should('have.text', expertData.originalName)
        clientsAppPage.getEPLAction().should('have.text', 'Scheduling requested')

        clientsAppPage.getCancelRequestButton().click()
        clientsAppPage.getCancelRequestConfirmButton().click()
        clientsAppPage.getModalConsultationTitle().should('have.text', 'Consultation request cancelled')
        clientsAppPage.getCancellationOkButton().click()
        clientsAppPage.getRejectProfileButton().should('be.visible')
    })

    it('associate should see EPL status changed to Submitted', function () {
        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)

        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        cy.checkEPLStatus(expertData.originalName, 'Submitted')
    })

    it('expert should check Experts page that the EPL is not visible', function () {
        cy.intercept('GET', '**/api/expert/*/available-consultations').as('availableConsultations')

        cy.visit(expertQuickLoginLink)

        cy.wait('@availableConsultations').its('response.body').then(response => {
            if (response.length === 0) {
                expertsAppPage.getConsultationCardTitleInvitations().should('not.exist')
            }
            else
                expertsAppPage.getConsultationCardTitleInvitations().should('not.contain', projectName)
        })
        expertsAppPage.getSignOutBtn().click()
        cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
    })
})

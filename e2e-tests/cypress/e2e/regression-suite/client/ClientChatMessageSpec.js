import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'

describe('Client message tests', { tags: ["regression", "smoke"] }, function () {
    let expertFullName, localStorageAssociate, localStorageClient, projectId, clientProjectLink, testUsers
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const chatMessage = `I want to know if the expert is compatible and capable answering our questions for ${projectName}`
    const chatMessageReply = `The expert is compatible and capable for answering your questions for ${projectName}`
    const expertPipelinePage = new ExpertPipelinPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const globalPage = new GlobalPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                cy.fixture('testUsers').then(testusers => {
                    testUsers = testusers
                    expertFullName = `${testusers.expert.firstName} ${testusers.expert.lastName
                        }`
                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName).then(response => cy.log(response))

                    cy.requestLogIn(
                        testusers.teamLeader.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        localStorageAssociate = loginResponse.body

                        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)

                        cy.visit(
                            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
                        )
                        cy.wait(500)
                        cy.waitForLoadingDisappear()
                        cy.changeEPLStatus(expertFullName, 'Submitted')
                        expertPipelinePage.getEplStatusConfirmButton().click()
                        cy.checkEPLStatus(expertFullName, 'Submitted')
                    })

                    cy.requestClientsLogin(testusers.avenComplianceAuditor.emailAddress, Cypress.env('CYPRESS_EXTERNAL_PASSWORD')).then(
                        loginResponse => {
                            localStorageClient = loginResponse.body
                            cy.requestClientsGetProjectExternLink(loginResponse.body.token, projectId).then(
                                projectLinkResponse => {
                                    clientProjectLink = projectLinkResponse.body.externLink
                                }
                            )
                        }
                    )
                })
            }
        )
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)
        cy.intercept('POST', '/messaging-service/get-room-data').as('messagingService')
        cy.intercept('POST', `${Cypress.env('MESSAGING_SERVICE_URL')}/create-message`).as('createMessageRequest')
        cy.intercept('GET', '/api/settings/main/project/*').as('editSettings')
        cy.intercept('GET', `${Cypress.env('SHERLOCK_URL')}/api/comment?expertId=*`).as('saveSettings');
        cy.intercept('POST', `${Cypress.env('MESSAGING_SERVICE_URL')}/get-room-list`).as('clickUnreadMessage');
        cy.intercept('POST', '**/api/metrics').as('expertlogin')
        cy.intercept('POST', '**/messaging-service/get-room-list').as('messageList')
       
    })

    
    it('Access Message Tab when ClientAuth or Expert Auth is selected', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
        )
        projectDetailsPage.getClientAuthClientInterface(projectId,"clientAuth")
        projectDetailsPage.getMessagingTab(projectId).should('be.visible')
        projectDetailsPage.getClientAuthClientInterface(projectId,"clientAuth")
        projectDetailsPage.getMessagingTab(projectId).should('not.exist')

        projectDetailsPage.getClientAuthClientInterface(projectId,"expertAuth")
        projectDetailsPage.getMessagingTab(projectId).should('be.visible')
        projectDetailsPage.getClientAuthClientInterface(projectId,"expertAuth")
        projectDetailsPage.getMessagingTab(projectId).should('not.exist')
        

        projectDetailsPage.getClientAuthClientInterface(projectId,"clientAuth")
        projectDetailsPage.getClientAuthClientInterface(projectId,"expertAuth")
        projectDetailsPage.getMessagingTab(projectId).should('be.visible')

        projectDetailsPage.getClientAuthClientInterface(projectId,"clientAuth")
        projectDetailsPage.getClientAuthClientInterface(projectId,"expertAuth")
        projectDetailsPage.getMessagingTab(projectId).should('not.exist')
        
    })

    it('Warning Message Should Appear When Client Not Logged In', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
        )
        projectDetailsPage.getClientAuthClientInterface(projectId,"clientAuth")
       
       const link = clientProjectLink.split('?')
        cy.visit(link[0])
        cy.wait('@expertlogin')
        cy.wait(500)
        cy.get('[type="button"]').eq(1).click()
        globalPage.getEPLChatIcon().click()
        globalPage.getWarningModal().should('be.visible').then(WarningMessage => {
            expect(WarningMessage.text()).to.eql('You are not logged in. Please log in or use your original link so we can log you in.')
        })     
    })


    it('client should send message to project', function () {
        projectDetailsPage.getLogoutOKButton()
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`
        )
        cy.wait(1000)
        cy.waitForLoadingDisappear()
        projectDetailsPage.getSettings().click()
        cy.wait('@editSettings')
        projectDetailsPage.getEditPopUp().should('be.visible')
        globalPage.submitButton().click()
        cy.wait('@saveSettings')

        cy.visit(clientProjectLink)
        cy.wait('@messagingService')
        globalPage.getMessageIcon().click()
        globalPage.getChatBoxHeader().should('contain.text', expertFullName)

        globalPage.getChatBoxTextarea().type(chatMessage)

        globalPage.getChatBoxSendButton().click()
        cy.wait(2000)
        cy.wait('@createMessageRequest')
    })

    // epl chat
    // below code will be available when AP-4749 is fixed
    it.skip('Team Lead should get and reply to chat from Expert Pipeline', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )

        projectDetailsPage.getChatIconOnEPL().click()
        
        projectDetailsPage.getLastMessage()
        .then((lastmessageget) => {
                        expect(lastmessageget.text()).to.include(`${testUsers.avenComplianceAuditor.fullName}: ${chatMessage.slice(0, 57)}...`)
        
                    })

        projectDetailsPage.getChatRoomName().then(chatRoom => {

            const chatRoomName = chatRoom.text().split('-')
            const NameTrim = chatRoomName[chatRoomName.length - 1]
            cy.wait(3000)
            expect(NameTrim).to.include(projectName)
        })
    
        projectDetailsPage.getChatRoomName().click()
        cy.wait(3000)
        globalPage.getLastChatMessage().then(mes =>{
            expect(mes.text()).to.include(chatMessage)
        })
        globalPage.getChatBoxTextarea().type(chatMessageReply)
        globalPage.getChatBoxSendButton().click()
        cy.wait('@createMessageRequest')
    })

    // below code will be available when AP-4749 is fixed
    it.skip('client should get the replied message', function () {
        cy.visit(clientProjectLink)
        globalPage.getUnseenRobotIcon().click()
        cy.wait('@clickUnreadMessage')
        // globalPage.getUnseenMessage().should('have.text', 1).click()
        globalPage.getChatRoomNameMessage(projectName).then((lastmessageget) => {

        })
        .should('have.text', `Atheneum: ${chatMessageReply.slice(0, 57)}...`)
        globalPage.getLastChatMessage().should('have.text', chatMessageReply)
    })

    // project chat 
    it.skip('client should send a project chat message', function () {
        cy.visit(`${Cypress.env('CLIENTS_PLATFORM_APP_URL')}/auth/quick-login?token=${localStorageClient.token}&location=/`)

        globalPage.getChatIconByProjectName(projectName).click()

        globalPage.getChatBoxHeader().should('contain.text', expertFullName)

        globalPage.getChatBoxTextarea().type(chatMessage)

        globalPage.getChatBoxSendButton().click()

        cy.wait('@createMessageRequest')
    })

    it.skip('Team Lead should see the message in Project - Message section and reply', function () {
        cy.setLocalStorageLoginInfo(localStorageAssociate.user, localStorageAssociate.token)

        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/correspondence`
        )

        globalPage.getUnseenLabelMuiGrid().should('have.text', 1)
        globalPage.getUnseenChatWrapper().should('have.text', 1)

        projectDetailsPage.getLastMessage().should('have.text', `${testUsers.avenComplianceAuditor.fullName}: ${chatMessage.slice(0, 57)}...`)

        projectDetailsPage.getChatRoomName().should('be.visible').should('contain.text', projectName).click()

        globalPage.getLastChatMessage().should('have.text', chatMessage)

        globalPage.getChatBoxTextarea().type(chatMessageReply)

        globalPage.getChatBoxSendButton().click()

        cy.wait('@createMessageRequest')
    })
})

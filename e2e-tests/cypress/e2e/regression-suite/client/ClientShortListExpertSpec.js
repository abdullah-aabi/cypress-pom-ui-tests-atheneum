import generator from '../../../support/generator'
import ClientShortListPage from '../../../pageObjects/ClientShortListPage'

describe('Client Shortlisting Expert', { tags: "regression" }, function () {
    let authInfo,
        projectId,
        authToken,
        eplId,
        clientProjectLink

    let expertData = generator.generateExpertNames(1)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const clientShortListPage = new ClientShortListPage()
    const emptyMessage = 'There are currently no prepared experts on this project'

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.teamLeader.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
                authInfo = loginResponse

                cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                    expertCreateObject.firstName = expertData.firstName
                    expertCreateObject.lastName = expertData.lastName
                    expertCreateObject.originalName = expertData.originalName
                    expertCreateObject.email = expertData.email
                    cy.requestCreateExpert(authToken, expertCreateObject).then(
                        expertCreateResponse => {
                            expertData.expertId = expertCreateResponse.body.id
                        }
                    )
                })

            })
        })

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id
                cy.addAndInviteExpertToProjectFromAPI(projectId, expertData.expertId).then(
                    addAndInviteExpertToProjectFromAPIResponse => {
                        eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                        // Change EPL to submitted 
                        cy.requestGetEPL(authToken, eplId).then(eplRequestDataResponse => {
                            eplRequestDataResponse.body.eplStatusId = 5
                            eplRequestDataResponse.body.relevantExperience.experience.company = eplRequestDataResponse.body.relevantExperience.experience.company.name
                            eplRequestDataResponse.body.relevantExperience.experience.position = eplRequestDataResponse.body.relevantExperience.experience.position.name
                            cy.requestPutEPL(authToken, eplId, eplRequestDataResponse.body)

                        })
                    })
            })

    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/logged-event-extern/**`).as('metrics')
        cy.intercept('GET', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/epl/extern/*`).as('externWait')
    })

    it('Client should shortlist the expert', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project-search`)
        cy.requestClientsGetProjectLink(authToken, projectId).then(
            projectLinkResponse => {
                clientProjectLink = projectLinkResponse.body.externLink
                cy.visit(clientProjectLink)
            })
        clientShortListPage.getProjectTitle().then(title => {
            expect(title.text()).to.eql(projectName)
        })
        cy.wait('@metrics').its('response.statusCode').should('eq', 200)
        clientShortListPage.getCheckShortlist('Shortlist').should('be.visible').click()
        cy.wait('@externWait').its('response.statusCode').should('eq', 200)
        clientShortListPage.getCheckShortlist('Remove Shortlist').should('be.visible')
        clientShortListPage.getShortlistStatus().should('be.visible')

        // Shortlist Toggle On
        clientShortListPage.getToggle().click()
        cy.wait('@metrics').its('response.statusCode').should('eq', 200)
        clientShortListPage.getCheckShortlist('Shortlist').should('be.visible')
        clientShortListPage.getAllExpertTab().click()
        cy.wait('@metrics').its('response.statusCode').should('eq', 200)
        clientShortListPage.getCheckShortlist('Shortlist').should('be.visible')
        // Shortlist Toggle Off
        clientShortListPage.getToggle().click()

        // Remove ShortList
        clientShortListPage.getCheckShortlist('Remove Shortlist').should('be.visible').click()
        cy.wait('@externWait').its('response.statusCode').should('eq', 200)
        clientShortListPage.getCheckShortlist('Shortlist').should('be.visible')
        clientShortListPage.getShortlistStatus().should('not.exist')

        // Shortlist Toggle On
        clientShortListPage.getToggle().click()
        cy.wait('@metrics').its('response.statusCode').should('eq', 200)
        clientShortListPage.getEmptyMessage().should('have.text', emptyMessage)
    })
})

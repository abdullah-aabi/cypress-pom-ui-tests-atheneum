/* eslint-disable no-unused-expressions */
/// <reference types="Cypress" />
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import ExpertCreationPage from '../../../pageObjects/ExpertCreationPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'
const expertSearchRequestBody = require('../../../../fixtures/objects/expertSearchObject.json')

// need to change tag once checkboxs to select multiple experts are reintroduced
describe('Adding multiple PDL Experts', { tags: "specs_with_issues" }, function () {
    let expertData, testUsers, userToken, projectDetails
    let expertDetails = []

    const expertCount = 5
    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()
    const projectDetailsPage = new ProjectDetailsPage()

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const expertCreationPage = new ExpertCreationPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        cy.createProjectFromAPI(projectName, 'Expert Sessions')
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                cy.setLocalStorageLoginInfo(
                    loginResponse.body.user,
                    loginResponse.body.token
                )
                userToken = loginResponse.body.token
                //enable PDL expert results
                cy.requestSearchExperts(userToken, expertSearchRequestBody, true)

                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
                globalPage.getClearSearchButton().click()
            })
        })

        cy.fixture('projectDetails').then(testData => {
            projectDetails = testData
        })

        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })
    })

    it('should bulk invite to project and create all pdl experts', function () {
        cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/**/pipeline`).as('expertPipeLine')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('eplBulkCreateRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/email-check-bulk`).as('emailCheckRequest')

        expertSearchPage.getExpertNameField().type('suman{enter}')
        cy.wait('@expertSearchRequest').its('response.body').then(expertSearch => {
            let increment = 0;

            for (let i = 0; i < expertSearch.hits.hits.length; i++) {
                if (isNaN(expertSearch.hits.hits[i]._id)) {
                    expertSearchPage.getExpertItemLinkById(expertSearch.hits.hits[i]._id).find('input').click()
                    increment += 1
                }
                if (increment === expertCount) break
            }
        })

        expertSearchPage.getExpertsSelectedTotal().should('contain.text', expertCount)

        expertSearchPage.getAddInviteSelectedExperts().click()
        cy.waitForLoadingDisappear()

        cy.wait('@emailCheckRequest')
        expertCreationPage.getHeading().should('have.length', expertCount)

        // Fill in all Location fields
        // expertCreationPage.selectLocationQuickSelect(expertData.city)

        // Select Industry
        expertCreationPage.selectIndustryField(expertData.industry)

        // Fill in all Industry Experience (Relevance statement)
        expertCreationPage
            .fillIndustryExperiencePDL(expertData.industryExperience)

        // Fill in Postion
        expertCreationPage.selectPositionField(expertData.position)

        // Fill in Company
        expertCreationPage.selectCompanyField(expertData.company)

        // Fill in Start and End date
        expertCreationPage.selectFromDateField()
        expertCreationPage.selectToDateField()

        // Fill in all email fields
        expertCreationPage.getEmailField().each((expertEmailField) => {
            cy.get(expertEmailField).type(`pdl_expert_${generator.getRandomInt(2000)}@atheneum.ai`)
        })
        globalPage.getButtonByName('Save').click()

        // Project Invite flow

        expertInvitePage.selectProjectField(projectName)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()

        cy.clickInviteActionButton('As applied')

        cy.wait('@eplBulkCreateRequest').its('response').then(eplBulkCreateResponse => {
            expect(eplBulkCreateResponse.statusCode).to.eq(200)
        })


        cy.get('@eplBulkCreateRequest.all').should('have.length', 1)

        expertInvitePage
            .getExpertInvitedMessage()
            .should(
                'contain.text',
                `${projectDetails.expertsAddedMessageFirstPart} "${projectName}"`)

        cy.wait(500)
        globalPage.getNotificationMessage().first().should('have.text',
            `5 ${projectDetails.notificationForExpertAddedtoProject} ${projectName} out of 5`)


        expertInvitePage.goToProjectButton().click()
        projectDetailsPage.getProjectPipeline().click()
        cy.wait('@expertPipeLine').its('response').then(expertPipeLineResponse => {
            expect(expertPipeLineResponse.statusCode).to.eq(200)
            for (let i = 0; i < expertCount; i++) {
                expertDetails.push({ expertId: expertPipeLineResponse.body[i].expert.id, eplID: expertPipeLineResponse.body[i].id })
            }

            projectDetailsPage.getEPLStatus().each(expertStatus => {
                expect(expertStatus.text().trim()).to.equal('Applied')
                expect(expertDetails.length).to.eq(expertCount)
            })

            cy.wrap(expertDetails).each((expert) => {
                cy.requestDeleteEPLById(userToken, expert.eplID)
                cy.requestDeleteExpertById(userToken, expert.expertId)
            })
        })
    })
})

import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import AthenaListsPage from '../../../pageObjects/AthenaListsPage'
import generator from '../../../support/generator'
import { recurse } from 'cypress-recurse'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
const expertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')

describe('Perform Survey action for PDL expert', { tags: "regression" }, function () {
    let expertData, testUsers, manualListId, authToken, localStorage
    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()
    const athenaListsPage = new AthenaListsPage()
    const expertDetailsPage = new ExpertDetailsPage()
    const projectName = `${generator.generateTestName()} Expert Sessions project`


    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })

        cy.createProjectFromAPI(projectName, 'Expert Sessions')

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.dashboardTeamLeader.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
                localStorage = quickLoginResponse.body
                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

                //enable PDL expert results
                 
                cy.requestSearchExperts(authToken, expertSearchRequestBody, true)
                cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
                    for (let i = 0; i < expertLists.body.length; i++) {
                        manualListId = expertLists.body[i].id
                        cy.requestDeleteListInAthenaList(authToken, manualListId)
                    }
                })
            })
        })
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
                 globalPage.getClearSearchButton().click()
        
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert`).as('expertCreateRequest')
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/bulk-create`).as('eplBulkCreateRequest')
        cy.intercept('POST', '**/list').as('waitForCreateExpertList')
        cy.intercept('GET', '**/list?type=expert').as('waitForGetExpertList')
        cy.intercept('GET', '**/list/**').as('waitForGetExpertListById')
        cy.intercept('GET', '**/list/**/items?offset=0').as('waitToLoadItems')
        cy.intercept('POST', '**/item/many').as('waitForAddingRow')
        cy.intercept('POST', '**/mass-action').as('waitForMassAction')
        cy.intercept('POST', '**/mass-action/**/stop').as('waitForStop')
        cy.intercept('DELETE', '**/list/**').as('waitForDeletingList')
        cy.intercept('GET', '**/api/email-template/**').as('waitForEmailTemplate')
        cy.intercept('GET', '**/group/al_initial_outreach**').as('waitForInitialTemplate')
        cy.intercept('GET', '**/group/al_followup**').as('waitForFollowupEmailTemplate')
        cy.intercept('GET', '**/group/al_survey**').as('waitForSurveyEmailTemplate')
        cy.intercept('GET', '**/api/email-template/129').as('waitForEmailTemplate1')
        cy.intercept('GET', '**/api/email-template/132').as('waitForEmailTemplate2')
        cy.intercept('GET', '**/api/email-template/130').as('waitForEmailTemplate3')
        cy.intercept('POST', '**/api/expert/find-duplicates**').as('waitForProjectToLoadForExpert')
    })

    it('should add PDL expert to list by pinning in Expert search', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search`)
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            if (expertLists.body.length === 0) {
                cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
            }
            else {
                cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
            }
            cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
            cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
        })
        globalPage.getClearSearchButton().click()
        expertSearchPage.getAthenaListHeading().should('contain.text', 'Athena List')
        athenaListsPage.selectNewList('AL for PDL')
        cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
        expertSearchPage.getExpertNameField().type(`${expertData.pdlExperts.ALExpert.fullName}{enter}`)
        cy.wait('@expertSearchRequest').its('response.statusCode').should('equal', 200)
        expertSearchPage.getExpertResultField().should('have.length', 1)
        cy.wait(1000)
        expertSearchPage.getUniqueExpert().first().click()
        cy.wait('@waitForProjectToLoadForExpert').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getAddtoAthenaListBtn().should('be.visible')
        expertDetailsPage.getAddtoAthenaListBtn().click()     
        // Uncomment when pinning option is added back
        //expertSearchPage.getPinIcon().click({ force: true })        
        cy.wait('@waitForAddingRow').its('response.statusCode').should('eq', 200)
        expertSearchPage.getGoToListIcon().click()
        cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
        cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getListNameOnCard().should('have.value', 'AL for PDL')
        recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
            (experts) => experts === '1',
            {
                limit: 15,
                timeout: 15000,
                delay: 10
            }
        )
        athenaListsPage.getFirstNameInAddedRow().should('contain.text', expertData.pdlExperts.ALExpert.firstName)
        athenaListsPage.getLastNameInAddedRow().should('contain.text', expertData.pdlExperts.ALExpert.lastName)
    })

    it('should send email to PDL expert', function () {
        athenaListsPage.getSelectOption().select('Send email')
        cy.wait(['@waitForInitialTemplate', '@waitForInitialTemplate'])
        cy.wait(['@waitForFollowupEmailTemplate', '@waitForFollowupEmailTemplate'])
        cy.wait(['@waitForEmailTemplate1', '@waitForEmailTemplate1'])
        cy.wait(['@waitForEmailTemplate2', '@waitForEmailTemplate2'])
        // Uncomment when follow-up is introduced back
        // athenaListsPage.getNextBtnForEmail().click({force : true})
        // cy.wait('@waitForEmailTemplate1')
        // cy.wait('@waitForEmailTemplate2')
        cy.wait('@waitForInitialTemplate').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForFollowupEmailTemplate').its('response.statusCode').should('eq', 200)
        cy.wait(8000)
        athenaListsPage.getPlaceholder().click().type('{backspace}')
        athenaListsPage.getPreviewBtn().then(($el) => {
            cy.wrap($el).click({ force: true })
        })
        athenaListsPage.getPreviewTxt().should('contain.text', 'Preview')
        cy.wait(3000)
        athenaListsPage.getExpandBtnForEmailDetail().last().should('be.visible').click()
        athenaListsPage.getEmailTo().contains(expertData.pdlExperts.ALExpert.emailAddress, { matchCase: false })
        athenaListsPage.getEmailSendBtn().last().scrollIntoView().should('be.visible').click()
        cy.wait('@waitForMassAction').its('response.statusCode').should('eq', 200)
        recurse(() => athenaListsPage.getStatus().children().its('length'),
            (length) => length > 0,
            {
                limit: 20,
                timeout: 60000,
                delay: 1000
            }
        )
        athenaListsPage.statusForEmailAction().should('have.text', 'queued')
        recurse(() => athenaListsPage.statusForEmailAction().invoke('text'),
            (status) => status !== 'queued',
            {
                limit: 50,
                timeout: 180000,
                delay: 1000
            }
        )
        athenaListsPage.statusForEmailAction().should('include.text', 'Email')
        athenaListsPage.getStopBtn().click()
        cy.wait('@waitForStop').its('response.statusCode').should('eq', 200)
    })

    it('Should send survey email to PDL Expert', function () {
        athenaListsPage.getSelectOption().select('Run survey')
        // Uncomment when follow-up is introduced back
        //athenaListsPage.getNextBtnForEmail().click()
        athenaListsPage.selectSearchSurvey('QA_survey')
        cy.get('.surveyActionContainer input').last().type('prefix')
        athenaListsPage.getNextBtn().click()
        cy.wait(1000)
        athenaListsPage.getPreviewBtn().then(($el) => {
            cy.wrap($el).click({ force: true })
        })
        athenaListsPage.getPreviewTxt().should('contain.text', 'Preview')
        cy.wait(2000)
        athenaListsPage.getExpandBtnForEmailDetail().last().should('be.visible').click()
        athenaListsPage.getEmailTo().contains(expertData.pdlExperts.ALExpert.emailAddress, { matchCase: false })
        athenaListsPage.getEmailSendBtn().last().scrollIntoView().should('be.visible').click()
        cy.wait('@waitForMassAction').its('response.statusCode').should('eq', 200)
        recurse(() => athenaListsPage.getStatus().children().its('length'),
            (length) => length > 0,
            {
                limit: 20,
                timeout: 60000,
                delay: 1000
            }
        )
        athenaListsPage.statusForEmailAction().should('have.text', 'queued')
        recurse(() => athenaListsPage.statusForEmailAction().invoke('text'),
            (status) => status !== 'queued',
            {
                limit: 50,
                timeout: 180000,
                delay: 1000
            }
        )
        athenaListsPage.getProcessingSurvey().should('include.text', 'Survey in progress')
        athenaListsPage.statusForEmailAction().should('include.text', 'Email')
        athenaListsPage.getStopBtn().click()
        cy.wait('@waitForStop').its('response.statusCode').should('eq', 200)
    })

    it('Should able to delete list', function () {
        athenaListsPage.getDeleteIconInList().should('be.visible').click()
        athenaListsPage.getDeleteConfirmationButton().click()
        cy.wait('@waitForDeletingList').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            for (let i = 0; i < expertLists.body.length; i++) {
                manualListId = expertLists.body[i].id
                cy.requestDeleteListInAthenaList(authToken, manualListId)
            }
        })
        cy.reload()
        cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            expect(expertLists.body.length, '0')
        })
    })
})

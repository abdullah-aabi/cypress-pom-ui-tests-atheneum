import generator from '../../../support/generator'
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import AthenaListsPage from '../../../pageObjects/AthenaListsPage'
import { recurse } from 'cypress-recurse'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'


describe('Fill Athena list from Expert-Search', { tags: "regression" }, function () {
    let testUsers, authToken, localStorage, ESListId, manualListId
    let expertNamesData = []
    let createdExperts = []

    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()
    const athenaListsPage = new AthenaListsPage()
    const expertDetailsPage = new ExpertDetailsPage()

    const generateExpertNames = () => {
        const firstName = generator.generateFirstName()
        const lastName = generator.generateLastName()
        expertNamesData.push({
            firstName: firstName,
            lastName: lastName,
            originalName: `${firstName} ${lastName}`,
            email: `${firstName + lastName}@mail.com`
        })
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        generateExpertNames()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
                localStorage = quickLoginResponse.body
                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
                    for (let i = 0; i < expertLists.body.length; i++) {
                        manualListId = expertLists.body[i].id
                        cy.requestDeleteListInAthenaList(authToken, manualListId)
                    }
                })
            })
        })

        cy.fixture('projectDetails')
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
                            fullName: expertCreateObject.originalName,
                            emailAddres: expertCreateObject.email,
                            lastName: expertCreateObject.lastName,
                            firstName: expertCreateObject.firstName
                        })
                )
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchCall')
        cy.intercept('POST', '**/item/many').as('waitForAddingRow')
        cy.intercept('POST', '**/list').as('waitForCreateExpertList')
        cy.intercept('GET', '**/list?type=expert').as('waitForGetExpertList')
        cy.intercept('GET', '**/list/**').as('waitForGetExpertListById')
        cy.intercept('DELETE', '**/item/**').as('waitForDeletingRow')
        cy.intercept('DELETE', '**/list/**').as('waitForDeletingList')
        cy.intercept('POST', '**/list/**/share').as('waitForSharingList')
        cy.intercept('POST', '**/api/expert/sherlock-list').as('waitForSherlockList')
        cy.intercept('POST', '**/mass-action').as('waitForMassAction')
        cy.intercept('PATCH', '**/item/**').as('waitForUpdatingItem')
        cy.intercept('PATCH', '**/list/**').as('waitForUpdatingList')
        cy.intercept('GET', '**/survey').as('waitForGettingSurvey')
        cy.intercept('GET', '**/list/**/items?offset=0').as('waitToLoadItems')
        cy.intercept('GET', '**/employee/**').as('waitForEmployeeDetails')
        cy.intercept('POST', '**/mass-action/**/stop').as('waitForStop')
        cy.intercept('POST', '**/api/expert/projects/**').as('waitForProjectToLoadForExpert')
    })

    it('should send Survey email to pinned experts from Athena list', function () {
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/expert-search')
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
        athenaListsPage.selectNewList('AL for survey')
        cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
        expertSearchPage.getExpertNameField().type(`${createdExperts[0].fullName}{enter}`)
        cy.wait('@expertSearchCall').its('response.statusCode').should('eq', 200)
        cy.wait(1000)
        expertSearchPage.getUniqueExpert().first().click()
        cy.wait('@waitForProjectToLoadForExpert').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getAddtoAthenaListBtn().should('be.visible')
        expertDetailsPage.getAddtoAthenaListBtn().click()   
        // Uncomment when pinning option is added back
        //expertSearchPage.getPinIcon().click({ force: true }) 
        cy.wait('@waitForAddingRow').its('response.statusCode').should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/list`)
        cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForEmployeeDetails').its('response.statusCode').should('eq', 200)
        cy.wait(1000)
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            ESListId = expertLists.body.filter(AL => AL.name === 'AL for survey')[0].id
            athenaListsPage.getViewButtonOnCard(ESListId).click()
            cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
            cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
            athenaListsPage.getListNameOnCard().should('have.value', 'AL for survey')
            recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
                (experts) => experts === '1',
                {
                    limit: 15,
                    timeout: 15000,
                    delay: 100
                }
            )
        })

        athenaListsPage.getSelectOption().select('Run survey')
        // Uncomment when follow-up is introduced back
        // athenaListsPage.getNextBtnForEmail().click()
        athenaListsPage.selectSearchSurvey('QA_survey')
        cy.get('.surveyActionContainer input').last().type('prefix')
        athenaListsPage.getNextBtn().click()
        cy.wait(1000)
        athenaListsPage.getPreviewBtn().then(($el) => {
            cy.wrap($el).click({ force: true })
        })
        athenaListsPage.getPreviewTxt().should('contain.text', 'Preview')
        cy.wait(1000)
        athenaListsPage.getExpandBtnForEmailDetail().last().should('be.visible').click()
        athenaListsPage.getEmailTo().contains(createdExperts[0].emailAddres, { matchCase: false })
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

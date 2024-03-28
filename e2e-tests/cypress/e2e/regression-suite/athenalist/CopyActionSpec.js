import generator from '../../../support/generator'
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import AthenaListsPage from '../../../pageObjects/AthenaListsPage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import { recurse } from 'cypress-recurse'


describe('Fill Athena list from Expert-Search', { tags: "regression" }, function () {
    let testUsers, authToken, localStorage, ESListId, manualListId, createdExpert

    const expertSearchPage = new ExpertSearchPage()
    const globalPage = new GlobalPage()
    const athenaListsPage = new AthenaListsPage()
    const expertDetailsPage = new ExpertDetailsPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()

        let expertData = generator.generateExpertNames(1)[0]

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.associate.emailAddress,
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

        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = expertData.firstName
            expertCreateObject.lastName = expertData.lastName
            expertCreateObject.originalName = expertData.originalName
            expertCreateObject.email = expertData.email
            cy.requestCreateExpert(authToken, expertCreateObject).then(
                expertCreateResponse =>
                    createdExpert = {
                        expertId: expertCreateResponse.body.id,
                        fullName: expertCreateObject.originalName,
                        emailAddres: expertCreateObject.email,
                        lastName: expertCreateObject.lastName,
                        firstName: expertCreateObject.firstName
                    }
            )
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
        cy.intercept('GET', '**/survey').as('waitForGettingSurvey')
        cy.intercept('GET', '**/list/**/items?offset=0').as('waitToLoadItems')
        cy.intercept('POST', '**/api/expert/projects/**').as('waitForProjectToLoadForExpert')
    })

    it('Should pin expert on default Athena list', function () {
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
        athenaListsPage.selectNewList('Source list')
        cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
        expertSearchPage.getExpertNameField().type(`${createdExpert.fullName}{enter}`)
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
        athenaListsPage.getNewListNameOnCard().should('have.value', 'Source list')
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            ESListId = expertLists.body.filter(AL => AL.name === 'Source list')[0].id
            athenaListsPage.getViewButtonOnCard(ESListId).click()
            cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
            cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
            athenaListsPage.getListNameOnCard().should('have.value', 'Source list')
            recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
                (experts) => experts === '1',
                {
                    limit: 15,
                    timeout: 15000,
                    delay: 100
                }
            )
        })
    })

    it('Should move item to new list', function () {
        athenaListsPage.getSelectOption().select('Copy to List')
        athenaListsPage.selectNewList('Destination list')
        cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
        cy.wait(500)
        athenaListsPage.getMoveBtn().should('contain.text', 'Move').click()
        cy.wait('@waitForMassAction').its('response.statusCode').should('eq', 200)
        recurse(() => athenaListsPage.getStatus().children().its('length'),
            (length) => length > 0,
            {
                limit: 50,
                timeout: 60000,
                delay: 1000
            }
        )
        athenaListsPage.statusForEmailAction().should('have.text', 'queued')
        recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
            (experts) => experts === '0',
            {
                limit: 50,
                timeout: 120000,
                delay: 1000
            }
        )
        athenaListsPage.getItemRows().should('have.length', 0)
        athenaListsPage.getGoToListBtn().contains('Go to list').click()
        cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
        cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getFirstNameInAddedRow().should('contain.text', createdExpert.firstName)
        athenaListsPage.getLastNameInAddedRow().should('contain.text', createdExpert.lastName)
        athenaListsPage.getEmailInAddedRow().should('contain.text', createdExpert.emailAddres, { matchCase: false })
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

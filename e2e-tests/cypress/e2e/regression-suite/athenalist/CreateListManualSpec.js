import generator from '../../../support/generator'
import AthenaListsPage from '../../../pageObjects/AthenaListsPage'
import { recurse } from 'cypress-recurse'

describe('Fill Athena list manually', { tags: "regression" }, function () {
    let authInfo,
        authToken,
        manualListId,
        expertData

    const athenaListsPage = new AthenaListsPage()
    const todaysDate = `${generator.todayDateinDDMMYYYYFormat()}`
    const expertFirstName = generator.generateFirstName()
    const expertLastName = generator.generateLastName()
    const expertEmail = `${expertFirstName + expertLastName}@mail.com`
    const editExpertFirstName = generator.generateFirstName()
    const editExpertLastName = generator.generateLastName()
    const expertEditEmail = `${editExpertFirstName + editExpertLastName}1@mail.com`

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.accountManager.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body.token
                authInfo = loginResponse
                cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
                    for (let i = 0; i < expertLists.body.length; i++) {
                        manualListId = expertLists.body[i].id
                        cy.requestDeleteListInAthenaList(authToken, manualListId)
                    }
                })
            })
        })
        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
        })
    })

    beforeEach(function () {
        cy.intercept('POST', '**/list').as('waitForCreateExpertList')
        cy.intercept('GET', '**/list?type=expert').as('waitForGetExpertList')
        cy.intercept('GET', '**/list/**').as('waitForGetExpertListById')
        cy.intercept('PATCH', '**/list/**').as('waitForPATCHExpertListById')
        cy.intercept('GET', '**/api/employee/**').as('waitForEmployee')
        cy.intercept('POST', '**/item').as('waitForAddingRow')
        cy.intercept('DELETE', '**/item/**').as('waitForDeletingRow')
        cy.intercept('DELETE', '**/list/**').as('waitForDeletingList')
        cy.intercept('POST', '**/list/**/share').as('waitForSharingList')
        cy.intercept('GET', '**/list/**/items?offset=0').as('waitToLoadItems')
        cy.intercept('PATCH', '**//mass-processor/item/**').as('waitToEditItems')

        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
    })

    it('Create new empty expert list manually', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/list`)
        athenaListsPage.getListHeading().should('have.text', 'List Management')
        athenaListsPage.getCreateListBtn().click()
        cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
        cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            manualListId = expertLists.body[0].id
        })
        athenaListsPage.getListNameOnCard().first().should('have.attr', 'placeholder', 'My List')
        athenaListsPage.getListNameOnCard().first().clear().type('Manual Expert List')
        cy.wait('@waitForPATCHExpertListById').its('response.statusCode').should('eq', 200)
        athenaListsPage.getExpertCountOnCard().first().should('have.text', 0)
        athenaListsPage.getOwnerOnCard().first().should('have.text', 'Test AccountManager')
        athenaListsPage.getOwnderIntitalsOnCard().first().should('have.text', 'TA')
    })

    it('Add row in created expert list manually', function () {
        athenaListsPage.getViewButtonOnCard(manualListId).click()
        cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
        cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getListNameOnCard().should('have.value', 'Manual Expert List')
        recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
            (experts) => experts === '0',
            {
                limit: 15,
                timeout: 15000,
                delay: 100
            }
        )
        athenaListsPage.getCreatedDateOnList().should('contain.text', todaysDate)
        athenaListsPage.getAddRowBtn().click()
        cy.wait('@waitForAddingRow').its('response.statusCode').should('eq', 200)
        athenaListsPage.getFirstNameInAddedRow().type(expertFirstName)
        athenaListsPage.getLastNameInAddedRow().type(expertLastName)
        athenaListsPage.getEmailInAddedRow().dblclick()
        athenaListsPage.getEmailField().type(expertEmail)
        athenaListsPage.getEmailField().type('{enter}')
        athenaListsPage.getCompany().type(expertData.company)
        athenaListsPage.getPosition().type(expertData.position)
        athenaListsPage.getPosition().type('{enter}')
        athenaListsPage.getFirstNameInAddedRow().should('contain.text', expertFirstName)
        athenaListsPage.getLastNameInAddedRow().should('contain.text', expertLastName)
        athenaListsPage.getEmailInAddedRow().should('contain.text', expertEmail)
    })

    it('Should edit created row', function () {
        athenaListsPage.getFirstNameInAddedRow(expertFirstName).type('{enter}')
        athenaListsPage.getFirstNameInAddedRow(expertFirstName).clear().type(editExpertFirstName)
        athenaListsPage.getCompany().click()
        cy.wait('@waitToEditItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getLastNameInAddedRow(expertLastName).type('{enter}')
        athenaListsPage.getLastNameInAddedRow(expertLastName).clear().type(editExpertLastName)
        athenaListsPage.getCompany().click()
        cy.wait('@waitToEditItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getEmailInAddedRow().dblclick()
        athenaListsPage.getEmailField().clear().type('{enter}')
        athenaListsPage.getEmailInAddedRow().dblclick()
        athenaListsPage.getEmailField().type(expertEditEmail)
        athenaListsPage.getEmailField().type('{enter}')
        athenaListsPage.getCompany().click()
        cy.wait('@waitToEditItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getFirstNameInAddedRow().should('contain.text', editExpertFirstName)
        athenaListsPage.getLastNameInAddedRow().should('contain.text', editExpertLastName)
        athenaListsPage.getEmailInAddedRow().should('contain.text', expertEditEmail)
    })

    it('Should add column in created list', function () {
        athenaListsPage.getAddColumnAction().click()
        athenaListsPage.getAddTitleForNewColumn().type('My Data')
        athenaListsPage.selectFieldName('My Data')
        athenaListsPage.getSubmitButton().click()
        cy.wait('@waitForPATCHExpertListById').its('response.statusCode').should('eq', 200)
        athenaListsPage.getColumnName().should('include.text', 'My Data')
        athenaListsPage.getCountOfExpertAfterAdding().should('contain.text', 1)
    })

    it('Should delete a column in created list', function () {
        athenaListsPage.selectColumMenu().click()
        athenaListsPage.getDeleteColumnBtn().click()
        cy.wait('@waitForPATCHExpertListById').its('response.statusCode').should('eq', 200)
        athenaListsPage.getColumnName().should('not.include.text', 'My Data')
        athenaListsPage.getCountOfExpertAfterAdding().should('contain.text', 1)
    })

    it('Should able to share created list', function () {
        athenaListsPage.getShareIcon().click()
        athenaListsPage.selectSearchEmployee('Test Associate')
        cy.wait('@waitForSharingList').its('response.statusCode').should('eq', 200)
        athenaListsPage.getOwnderIntitalsOnList().should('contain.text', 'TA')
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/list`)
        cy.wait('@waitForEmployee').its('response.statusCode').should('eq', 200)
        athenaListsPage.getOwnderIntitalsOnCard().should('have.length', 2)
    })

    it('Should able to delete created row in the list', function () {
        athenaListsPage.getViewButtonOnCard(manualListId).click()
        cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
        cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
        athenaListsPage.getDeleteIconOnARow().click()
        cy.wait('@waitForDeletingRow').its('response.statusCode').should('eq', 200)
    })

    it('Should able to delete created list', function () {
        athenaListsPage.getBackIconOnList().click()
        cy.wait('@waitForEmployee').its('response.statusCode').should('eq', 200)
        athenaListsPage.getDeleteIconOnCard().first().click()
        athenaListsPage.getDeleteConfirmationButton().click()
        cy.wait('@waitForDeletingList').its('response.statusCode').should('eq', 200)

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
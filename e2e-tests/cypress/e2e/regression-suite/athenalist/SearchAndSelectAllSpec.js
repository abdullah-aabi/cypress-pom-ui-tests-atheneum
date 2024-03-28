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
        for (let i = 0; i <= 1; i++) {
            const firstName = generator.generateFirstName()
            const lastName = generator.generateLastName()
            expertNamesData.push({
                firstName: firstName,
                lastName: lastName,
                originalName: `${firstName} ${lastName}`,
                email: `${firstName + lastName}@mail.com`
            })
        }
    }
    // const normalizeText = (s) => s.replace(/\s/g, '').toLowerCase()
    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        generateExpertNames()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.requestLogIn(
                testUsers.accounting.emailAddress,
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
        cy.intercept('GET', '**/survey').as('waitForGettingSurvey')
        cy.intercept('GET', '**/list/**/items?offset=0').as('waitToLoadItems')
        cy.intercept('POST', '**/mass-action/**/stop').as('waitForStop')
        cy.intercept('GET', '**/api/email-template/**').as('waitForEmailTemplate')
        cy.intercept('GET', '**/group/al_initial_outreach**').as('waitForInitialTemplate')
        cy.intercept('GET', '**/group/al_followup**').as('waitForFollowupEmailTemplate')
        cy.intercept('GET', '**/group/al_survey**').as('waitForSurveyEmailTemplate')
        cy.intercept('GET', '**/api/email-template/129').as('waitForEmailTemplate1')
        cy.intercept('GET', '**/api/email-template/132').as('waitForEmailTemplate2')
        cy.intercept('GET', '**/api/email-template/130').as('waitForEmailTemplate3')
        cy.intercept('POST', '**/api/expert/projects/**').as('waitForProjectToLoadForExpert')
    })

    it('Should select only searched items and perform Email on only slected items', function () {
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
        athenaListsPage.selectNewList('Select searched list')
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
        globalPage.getClearSearchButton().click()
        expertSearchPage.getExpertNameField().type(`${createdExperts[1].fullName}{enter}`)
        cy.wait('@expertSearchCall').its('response.statusCode').should('eq', 200)
        cy.wait(1000)
        expertSearchPage.getUniqueExpert().first().click()
        cy.wait('@waitForProjectToLoadForExpert').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getAddtoAthenaListBtn().should('be.visible')
        expertDetailsPage.getAddtoAthenaListBtn().click()
        // Uncomment when pinning option is added back
        // expertSearchPage.getPinIcon().click({ force: true })
        cy.wait('@waitForAddingRow').its('response.statusCode').should('eq', 200)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/list`)
        cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
        athenaListsPage.getNewListNameOnCard().should('have.value', 'Select searched list')
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
            ESListId = expertLists.body.filter(AL => AL.name === 'Select searched list')[0].id
            athenaListsPage.getViewButtonOnCard(ESListId).click()
            cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
            cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
            athenaListsPage.getListNameOnCard().should('have.value', 'Select searched list')
            recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
                (experts) => experts === '2',
                {
                    limit: 15,
                    timeout: 15000,
                    delay: 100
                }
            )
        })

        athenaListsPage.getSearchIcon().type(createdExperts[0].emailAddres)
        athenaListsPage.getItemRows().should('have.length', 1)
        athenaListsPage.getEmailInAddedRow().should('contain.text', createdExperts[0].emailAddres, { matchCase: false })
        athenaListsPage.getSelectAll().click()
        athenaListsPage.getSelectOption().select('Send email')
        cy.wait(['@waitForInitialTemplate', '@waitForInitialTemplate'])
        cy.wait(['@waitForFollowupEmailTemplate', '@waitForFollowupEmailTemplate'])
        cy.wait(['@waitForEmailTemplate1', '@waitForEmailTemplate1'])
        cy.wait(['@waitForEmailTemplate2', '@waitForEmailTemplate2'])
        // Uncomment when follow-up is introduced back
        // athenaListsPage.getNextBtnForEmail().click({force : true})
        // cy.wait('@waitForEmailTemplate1')
        // cy.wait('@waitForEmailTemplate2')
        // cy.wait('@waitForInitialTemplate').its('response.statusCode').should('eq', 200)
        // cy.wait('@waitForFollowupEmailTemplate').its('response.statusCode').should('eq', 200)
        cy.wait(6000)
        athenaListsPage.getPlaceholder().click().type('{backspace}')
        athenaListsPage.getPreviewBtn().then(($el) => {
            cy.wrap($el).click({ force: true })
        })
        athenaListsPage.getPreviewTxt().should('contain.text', 'Preview')
        cy.wait(1000)
        athenaListsPage.getExpandBtnForEmailDetail().last().should('be.visible').click()
        athenaListsPage.getEmailTo().contains(createdExperts[0].emailAddres, { matchCase: false })
        athenaListsPage.getEmailCountOnPreview().should('include.text', '1/1')
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

    it('Should select items only with/without status', function () {
        // TODO: Remove comment when the issue is solved
        /*    athenaListsPage.getSearchIcon().clear()
           athenaListsPage.getWithStatus().click()
           cy.wait(1000)
           athenaListsPage.getEmailInAddedRow().should('have.value', createdExperts[0].emailAddres, { matchCase: false })
           athenaListsPage.statusForEmailAction().should('include.text', 'Email')
           emailWithoutStatus = normalizeText(createdExperts[1].emailAddres)
           athenaListsPage.getWithoutStatus().click()
           athenaListsPage.getEmailInAddedRow().contains(emailWithoutStatus, { matchCase: false })
        */
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

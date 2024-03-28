import GlobalPage from '../../../pageObjects/GlobalPage'
import DashboardPage from '../../../pageObjects/DashboardPage'

const {
    generateTestName
} = require('../../../support/generator')

describe('Associate searching for projects', { tags: "regression" }, function () {
    let testUsers,
        authToken

    const projectName = `${generateTestName()} Expert Sessions project`
    const globalPage = new GlobalPage()
    const dashboardPage = new DashboardPage()

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.createProjectFromAPI(projectName, 'Expert Sessions')
            cy.requestLogIn(
                testUsers.associate.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(
            authToken.user,
            authToken.token
        )
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/dashboard')
    })

    it('should search the project by project name using Search Anything method on 1080x1900', { tags: "smoke" }, function () {
        dashboardPage.getTeamRevenueSection()
        // cy.percySnapshot('desktop.dashboard', { widths: [1900], minHeight: 1080 })
        globalPage.getSearchAnythingInput().type(projectName)
        globalPage.getSearchAnythingResults().should('contain.text', projectName)

        cy.requestQuickSearch(authToken.token, projectName).then(searchResults => {
            globalPage.getSearchAnythingResults().then(elements => {
                cy.log(elements)
                for (let index = 0; index < elements.length; index++) {
                    expect(elements[index].innerText).to.include(
                        searchResults.body[index].menuTitle
                    )
                    expect(elements[index].firstChild.innerText).to.eq(
                        searchResults.body[index].indexType
                    )
                }
            })
        })
    })

    it('should search the project by project name using Search Anything method iPhone', function () {
        cy.viewport('iphone-x').reload()
        dashboardPage.getMobileTeamRevenue()
        // cy.percySnapshot('iphone.dashboard', { widths: [375], minHeight: 812 })
        globalPage.toggleMobileMenu().click()
        globalPage.getSearchAnythingInput('mobile').should('be.visible')
        // cy.percySnapshot('iphone.dashboard.sidebar', { widths: [375], minHeight: 812 })
        globalPage.getSearchAnythingInput('mobile').type(projectName)
        globalPage.getMobileSearchAnythingResults().should('contain.text', projectName)

        cy.requestQuickSearch(authToken.token, projectName).then(searchResults => {
            globalPage.getMobileSearchAnythingResults().then(elements => {
                for (let index = 0; index < elements.length; index++) {
                    expect(elements[index].innerText).to.include(
                        searchResults.body[index].menuTitle
                    )
                    expect(elements[index].firstChild.innerText).to.eq(
                        searchResults.body[index].indexType
                    )
                }
            })
        })
    })

    it('should search the project by project name using Search Anything method iPad Mini', function () {
        cy.viewport('ipad-mini').reload()
        dashboardPage.getMobileTeamRevenue()
        // cy.percySnapshot('ipad.dashboard', { widths: [768] })
        globalPage.toggleMobileMenu().click()
        globalPage.getSearchAnythingInput('mobile').should('be.visible')
        // cy.percySnapshot('ipad.dashboard.sidebar', { widths: [768] })

        globalPage.getSearchAnythingInput('mobile').type(projectName)
        globalPage.getMobileSearchAnythingResults().should('contain.text', projectName)

        cy.requestQuickSearch(authToken.token, projectName).then(searchResults => {
            globalPage.getMobileSearchAnythingResults().then(elements => {
                for (let index = 0; index < elements.length; index++) {
                    expect(elements[index].innerText).to.include(
                        searchResults.body[index].menuTitle
                    )
                    expect(elements[index].firstChild.innerText).to.eq(
                        searchResults.body[index].indexType
                    )
                }
            })
        })
    })
})


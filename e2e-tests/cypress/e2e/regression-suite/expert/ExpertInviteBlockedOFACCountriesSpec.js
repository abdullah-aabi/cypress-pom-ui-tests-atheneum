import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import generator from '../../../support/generator'
const OFACSanctionedCountries = require('../../../fixtures/OFACRestrictedCountries.json')

describe('Team Leader should be blocked to invite experts from OFAC Sanctioned Countries', { tags: "regression" }, () => {
    let authInfo, staticDataResponse

    let expertNamesData = []
    let createdExperts = []

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()

    const generateExpertNames = () => {
        for (let i = 0; i < OFACSanctionedCountries.length; i++) {
            const firstName = generator.generateFirstName()
            const lastName = generator.generateLastName()

            expertNamesData.push({
                firstName: firstName,
                lastName: lastName,
                originalName: `${firstName} ${lastName}`,
                email: `${firstName + lastName}@mail.com`,
                secondEmail: `${firstName + lastName}123@mail.com`,
                newPhone: generator.generatePhoneNumber(),
                company: 'Poindexter Nut Company',
                position: 'Quality Assurance Manager',
                description: 'Responsibilities include food safety, quality assurance, sanitation, customer service, regulatory affairs, R&D, equipment/process validation',
            })
        }
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        generateExpertNames()

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                cy.fixture('testUsers').then(testUsers => {
                    cy.requestLogIn(
                        testUsers.teamLeader.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        authInfo = loginResponse
                        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
                        cy.requestGetStaticData(loginResponse.body.token).then(staticData => {
                            staticDataResponse = staticData.body
                        })

                        //create experts and add them to the project
                        cy.wrap(expertNamesData).each((expert, index) => {
                            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                                expertCreateObject.firstName = expert.firstName
                                expertCreateObject.lastName = expert.lastName
                                expertCreateObject.originalName = expert.originalName
                                expertCreateObject.email = expert.email

                                // Location
                                const countryObject = staticDataResponse.countries.find(country => country.name === OFACSanctionedCountries[index].country)
                                expertCreateObject.address.city = OFACSanctionedCountries[index].city
                                expertCreateObject.address.state = OFACSanctionedCountries[index].city
                                expertCreateObject.address.countryId = countryObject.id
                                expertCreateObject.address.timezoneId = countryObject.timezoneId

                                cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                                    expertCreateResponse => {
                                        createdExperts.push({
                                            expertId: expertCreateResponse.body.id,
                                            fullName: expertCreateObject.originalName,
                                            emailAddres: expertCreateObject.email,
                                            country: countryObject.name
                                        })
                                    }
                                )
                            })
                        })
                    })
                })
            }
        )

    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authInfo.body.user, authInfo.body.token)
        cy.intercept('GET', '**/items?offset=0').as('waitToLoadList')
        cy.intercept('POST', '**/bulk-validate').as('waitForbulkValidate')
    })

    OFACSanctionedCountries.forEach((sanctionedCountry, index) => {
        it(`should display an error message when trying to invite expert from ${sanctionedCountry.country}`, function () {
            cy.visit(
                `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[index].expertId
                }`
            )
            cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
            expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
            expertInvitePage.selectProjectField(projectName)
            cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
            cy.waitForLoadingDisappear()
            expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'The expert is from OFAC Sanctioned Country, connect with Compliance Office.')
        })
    })
})

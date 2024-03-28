import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'
import ExpertsAppPage from '../../../pageObjects/ExpertsAppPage'
import generator from '../../../support/generator'

describe('Expert Relationship Manager Compliance Agreement Tests', { tags: "regression" }, function () {
    let expertData, testUsers, authToken, localStorage
    let expertNamesData = []
    let createdExperts = []

    const globalPage = new GlobalPage()
    const expertsAppPage = new ExpertsAppPage()
    const expertDetailsPage = new ExpertDetailsPage()

    const generateExpertNames = () => {
        for (let i = 0; i <= 3; i++) {
            const firstName = generator.generateFirstName()
            const lastName = generator.generateLastName()

            expertNamesData.push({
                firstName: firstName,
                lastName: lastName,
                originalName: `${firstName} ${lastName}`,
                email: `${firstName + lastName}@mail.com`,
                secondEmail: `${firstName + lastName}123@mail.com`,
                newPhone: '+333393999929292',
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

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers

            cy.requestLogIn(
                testUsers.erm.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(quickLoginResponse => {
                authToken = quickLoginResponse.body.token
                localStorage = quickLoginResponse.body
                cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
            })
        })

        cy.fixture('expertDetails').then(expertDetails => {
            expertData = expertDetails
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
                            emailAddres: expertCreateObject.email
                        })
                )
            })
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    })

    it('should not change the expert status when the expert Declines the Compliance from Experts platform', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId}`
        )

        expertDetailsPage
            .getComplianceMissing()
            .should('have.text', 'Compliance missing')
        expertDetailsPage
            .getSherlock()
            .should('not.exist')

        cy.requestLoginAsExpertById(createdExperts[0].expertId).then(
            expertQuickLoginResponse => {
                cy.visit(expertQuickLoginResponse.body.link)
                expertsAppPage.getComplianceHeader().should('have.text', expertData.expertComplianceLandingMessage)

                expertsAppPage.getComplianceButton('Disagree').click()
                expertsAppPage.getComplianceDeclineMessage().should('have.text', expertData.complianceExpertDeclineMessage)

                expertsAppPage.getComplianceDeclineConfirmButton().click()
                expertsAppPage.getLoginEmailInput().should('be.visible')
            }
        )

        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId}`
        )

        expertDetailsPage
            .getComplianceMissing()
            .should('have.text', 'Compliance missing')
        expertDetailsPage
            .getSherlock()
            .should('not.exist')
    })

    it('should set expert status to Active Expert when the expert Accepts the Compliance, adds new contact information, changes the password and adds a new experience', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId}`
        )

        expertDetailsPage
            .getComplianceMissing()
            .should('have.text', 'Compliance missing')
        expertDetailsPage
            .getSherlock()
            .should('not.exist')

        cy.requestLoginAsExpertById(createdExperts[0].expertId).then(
            expertQuickLoginResponse => {
                cy.visit(expertQuickLoginResponse.body.link)

                expertsAppPage.getComplianceHeader().should('have.text', expertData.expertComplianceLandingMessage)
                expertsAppPage.getComplianceButton('I agree').click()
                expertsAppPage.getExpertConfirmInputFieldByName('Email').should('have.attr', 'value', expertNamesData[0].email)
                expertsAppPage.getExpertConfirmInputFieldByName('Email').clear().type(expertNamesData[0].secondEmail)

                expertsAppPage.getExpertConfirmInputFieldByName('Phone').clear().type(expertNamesData[0].newPhone)

                expertsAppPage.getExpertConfirmInputFieldByName('Company').clear().type(expertNamesData[0].company)
                expertsAppPage.getExpertConfirmInputFieldByName('Position').clear().type(expertNamesData[0].position)
                expertsAppPage.getExpertConfirmInputFieldByName('Brief Position Description', 'textarea').clear().type(expertNamesData[0].description)

                expertsAppPage.getComplianceButton('Confirm').click()

                expertsAppPage.getComplianceHeader().should('not.exist')
                globalPage.getNotificationTitle().should('have.text', 'Welcome to Atheneum!')
                globalPage
                    .getNotificationMessage()
                    .first()
                    .should('have.text', 'Thank you for signing the Expert Agreement.')
                expertsAppPage.getSignOutBtn().click()
                cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
            }
        )

        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[0].expertId}`
        )
        expertDetailsPage.getStatusLabel().should('have.text', 'Active Expert')
        expertDetailsPage
            .getComplianceInPlace()
            .should('contain', 'Compliance in place since')

        expertDetailsPage.getEmail()
            .should('have.length', 2)
            .should('contain.text', expertNamesData[0].secondEmail)
            .should('contain.text', expertNamesData[0].email)

        expertDetailsPage.getExpertDetailsValueByRowName('mobile').should('have.text', expertNamesData[0].newPhone)

        expertDetailsPage.getExperiencePositionByName(expertNamesData[0].position).should('have.text', expertNamesData[0].position)
        expertDetailsPage.getExperienceCompanyByName(expertNamesData[0].position).should('contain.text', expertNamesData[0].company)
        expertDetailsPage.getExperienceDescriptionByName(expertNamesData[0].position).should('have.text', expertNamesData[0].description)
    })

    it('should display message in /expert/compliance page if the expert email doesnt exist', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/compliance`)
        expertsAppPage.getExpertComplianceEmailAddress().type('valentin.petrache@test.com')
        expertsAppPage.getExpertComplianceNextButton().click()
        expertsAppPage.getExpertComplianceText().should('contain', expertData.complianceExpertMissingMessage)
    })

    it('should set expert status to Active Expert when the expert Accepts the Compliance through /expert/compliance link', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[1].expertId
            }`
        )
        expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
        expertDetailsPage
            .getComplianceMissing()
            .should('have.text', 'Compliance missing')
        expertDetailsPage
            .getSherlock()
            .should('not.exist')

        cy.requestLoginAsExpertById(createdExperts[1].expertId).then(
            expertQuickLoginResponse => {
                cy.visit(expertQuickLoginResponse.body.link)
                expertsAppPage.getComplianceHeader().should('have.text', expertData.expertComplianceLandingMessage)


                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/compliance`)
                expertsAppPage.getExpertComplianceEmailAddress().type(createdExperts[1].emailAddres)
                expertsAppPage.getExpertComplianceNextButton().click()
                expertsAppPage.getExpertComplianceText().should('contain', expertData.complianceExpertFoundMessage)
                expertsAppPage.getExpertComplianceNextButton().click()

                expertsAppPage.getComplianceButton('I Agree').click()
                expertsAppPage.getExpertConfirmInputFieldByName('Email').should('have.attr', 'value', expertNamesData[1].email)
                expertsAppPage.getExpertConfirmInputFieldByName('Email').clear().type(expertNamesData[1].secondEmail)

                expertsAppPage.getExpertConfirmInputFieldByName('Phone').clear().type(expertNamesData[1].newPhone)

                expertsAppPage.getExpertConfirmInputFieldByName('Company').clear().type(expertNamesData[1].company)
                expertsAppPage.getExpertConfirmInputFieldByName('Position').clear().type(expertNamesData[1].position)
                expertsAppPage.getExpertConfirmInputFieldByName('Brief Position Description', 'textarea').clear().type(expertNamesData[1].description)

                expertsAppPage.getComplianceButton('Confirm').click()
                expertsAppPage.getExpertComplianceText().should('contain', expertData.complianceAgreementAcceptedMessage)
                cy.visit(expertQuickLoginResponse.body.link)
                expertsAppPage.getSignOutBtn().click()
                cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
            })
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[1].expertId
            }`
        )
        expertDetailsPage.getStatusLabel().should('have.text', 'Active Expert')
        expertDetailsPage
            .getComplianceInPlace()
            .should('contain', 'Compliance in place since')

        expertDetailsPage.getEmail()
            .should('have.length', 2)
            .should('contain.text', expertNamesData[1].secondEmail)
            .should('contain.text', expertNamesData[1].email)

        expertDetailsPage.getExpertDetailsValueByRowName('mobile').should('have.text', expertNamesData[1].newPhone)

        expertDetailsPage.getExperiencePositionByName(expertNamesData[1].position).should('have.text', expertNamesData[1].position)
        expertDetailsPage.getExperienceCompanyByName(expertNamesData[1].position).should('contain.text', expertNamesData[1].company)
        expertDetailsPage.getExperienceDescriptionByName(expertNamesData[1].position).should('have.text', expertNamesData[1].description)
    })

    it('should send the Compliance reminder to expert and set status Compliance requested', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[2].expertId
            }`
        )
        expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
        expertDetailsPage
            .getComplianceMissing()
            .should('have.text', 'Compliance missing')
        expertDetailsPage
            .getSherlock()
            .should('not.exist')

        expertsAppPage.selectSendComplianceRequestEmail('English')

        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage
            .getNotificationMessage()
            .first()
            .should('have.text', 'Compliance in English sent!')

        expertDetailsPage
            .getComplianceMissing()
            .should('contain', 'Compliance requested')
    })

    it('should set expert status to Active Expert if Accepts the Compliance through link and selects employee', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[3].expertId
            }`
        )
        expertDetailsPage.getStatusLabel().should('have.text', 'Cold Prospect')
        expertDetailsPage
            .getComplianceMissing()
            .should('have.text', 'Compliance missing')
        expertDetailsPage
            .getSherlock()
            .should('not.exist')

        cy.requestLoginAsExpertById(createdExperts[3].expertId).then(
            expertQuickLoginResponse => {
                cy.visit(expertQuickLoginResponse.body.link)
                expertsAppPage.getComplianceHeader().should('have.text', expertData.expertComplianceLandingMessage)


                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/compliance`)
                expertsAppPage.selectAtheneumContact(testUsers.erm.fullName)

                expertsAppPage.getExpertComplianceEmailAddress().type(createdExperts[3].emailAddres)
                expertsAppPage.getExpertComplianceNextButton().click()
                expertsAppPage.getExpertComplianceText().should('contain', expertData.complianceExpertFoundMessage)
                expertsAppPage.getExpertComplianceNextButton().click()

                expertsAppPage.getComplianceButton('I Agree').click()
                expertsAppPage.getExpertConfirmInputFieldByName('Email').should('have.attr', 'value', expertNamesData[3].email)
                expertsAppPage.getExpertConfirmInputFieldByName('Email').clear().type(expertNamesData[3].secondEmail)

                expertsAppPage.getExpertConfirmInputFieldByName('Phone').clear().type(expertNamesData[3].newPhone)

                expertsAppPage.getExpertConfirmInputFieldByName('Company').clear().type(expertNamesData[3].company)
                expertsAppPage.getExpertConfirmInputFieldByName('Position').clear().type(expertNamesData[3].position)
                expertsAppPage.getExpertConfirmInputFieldByName('Brief Position Description', 'textarea').clear().type(expertNamesData[3].description)

                expertsAppPage.getComplianceButton('Confirm').click()
                expertsAppPage.getExpertComplianceText().should('contain', expertData.complianceAgreementAcceptedMessage)
                cy.visit(expertQuickLoginResponse.body.link)
                expertsAppPage.getSignOutBtn().click()
                cy.url().should('include', Cypress.env('EXPERTS_PLATFORM_APP_URL'))
            })
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert/${createdExperts[3].expertId
            }`
        )
        expertDetailsPage.getStatusLabel().should('have.text', 'Active Expert')
        expertDetailsPage
            .getComplianceInPlace()
            .should('contain', 'Compliance in place since')

        expertDetailsPage.getEmail()
            .should('have.length', 2)
            .should('contain.text', expertNamesData[3].secondEmail)
            .should('contain.text', expertNamesData[3].email)

        expertDetailsPage.getExpertDetailsValueByRowName('mobile').should('have.text', expertNamesData[3].newPhone)

        expertDetailsPage.getExperiencePositionByName(expertNamesData[3].position).should('have.text', expertNamesData[3].position)
        expertDetailsPage.getExperienceCompanyByName(expertNamesData[3].position).should('contain.text', expertNamesData[3].company)
        expertDetailsPage.getExperienceDescriptionByName(expertNamesData[3].position).should('have.text', expertNamesData[3].description)
    })
})

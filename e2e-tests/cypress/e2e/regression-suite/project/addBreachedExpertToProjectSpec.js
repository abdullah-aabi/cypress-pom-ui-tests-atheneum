import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'

describe('Team Leader adding sherlock blocked experts on a project', { tags: "regression" }, function () {
    let projectDetails, testUsers, authToken, expertDetails, employeeFullName
    let createdExperts = []

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const projectDetailsPage = new ProjectDetailsPage()
    const expertDetailsPage = new ExpertDetailsPage()
    const globalPage = new GlobalPage()

    let expertsData = generator.generateExpertNames(6, 'blocked.com')

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)

        cy.clearLocalAndSessionStorage()

        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            employeeFullName = `${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName
                }`

            cy.requestLogIn(
                testUsers.accountManager.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {
                authToken = loginResponse.body
            })

            cy.wrap(expertsData).each(expert => {
                cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                    expertCreateObject.firstName = expert.firstName
                    expertCreateObject.lastName = expert.lastName
                    expertCreateObject.originalName = expert.originalName
                    expertCreateObject.email = expert.email
                    cy.requestCreateExpert(authToken.token, expertCreateObject).then(
                        expertCreateResponse =>
                            createdExperts.push({
                                expertId: expertCreateResponse.body.id,
                                fullName: expertCreateObject.originalName,
                                email: expertCreateObject.email
                            })
                    )
                })
            })
        })

        cy.createProjectFromAPI(projectName, 'Expert Sessions')

        cy.fixture('projectDetails').then(testData => {
            projectDetails = testData
        })

        cy.fixture('expertDetails').then(testData => {
            expertDetails = testData
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
        cy.intercept('GET', '**/items?offset=0').as('waitToLoadList')
        cy.intercept('POST', '**/bulk-validate').as('waitForbulkValidate')
    })

    it('should select Add & Invite to Verify Review Segment and send email form data', { tags: "smoke" }, function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[0].expertId
            }`
        )
        cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getSherlock().should('be.visible')
        expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
        expertInvitePage.selectProjectField(projectName)
        cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        expertInvitePage.getExpertInviteButton().contains('Add & Invite').click()
        cy.waitForLoadingDisappear()

        expertInvitePage.getExpertSherlockWarning().should('contain', expertDetails.sherlockContactNotAllowed.replace('expertEmailAddress', createdExperts[0].email))
        expertInvitePage.getExpertSherlockWriteCommentButton().click()
        expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment.replace('expertName', createdExperts[0].fullName))
        expertInvitePage.getExpertSherlockCommentOkButton().click()

        cy.clickInviteActionButton('Add and invite')
        cy.waitForLoadingDisappear()

        expertInvitePage
            .getNumberOfExpertField()
            .should('have.attr', 'value', projectDetails.noOfExperts)
        projectDetailsPage
            .getScreeningTextAreaList()
            .first()
            .contains(projectDetails.screeningDefaultQuestion)
        projectDetailsPage
            .getScreeningTextAreaList()
            .last()
            .contains(projectDetails.screeningQuestion2)

        expertInvitePage.selectAssignedAssociatesField(employeeFullName)
        expertInvitePage.getSaveButton().click()
        cy.waitForLoadingDisappear()
        expertInvitePage
            .getSendEmailSenderField()
            .should('have.text', employeeFullName)
        expertInvitePage.getSendEmailToField().contains(createdExperts[0].fullName)
        expertInvitePage.getSaveButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')

    })

    it('should select Add & set reply to INTERESTED and verify success message', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[1].expertId
            }`
        )
        cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getSherlock().should('be.visible')
        expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
        expertInvitePage.selectProjectField(projectName)
        cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        expertInvitePage.getExpertInviteButton().contains('Interested').invoke('show').click({ force: true })
        cy.waitForLoadingDisappear()
        expertInvitePage.getSherlockWarning().should('contain', expertDetails.sherlockContactNotAllowed.replace('expertEmailAddress', createdExperts[1].email))
        expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment.replace('expertName', createdExperts[1].fullName))
        expertInvitePage.getExpertSherlockCommentOkButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
    })

    it('should select Add & set reply to APPLIED and verify success message', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[2].expertId
            }`
        )
        cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getSherlock().should('be.visible')
        expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
        expertInvitePage.selectProjectField(projectName)
        cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        expertInvitePage.getExpertInviteButton().contains('Applied').invoke('show').click({ force: true })
        cy.waitForLoadingDisappear()
        expertInvitePage.getSherlockWarning().should('contain', expertDetails.sherlockContactNotAllowed.replace('expertEmailAddress', createdExperts[2].email))
        expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment.replace('expertName', createdExperts[2].fullName))
        expertInvitePage.getExpertSherlockCommentOkButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
    })

    it('should select Add & set reply to CONFIRMED and verify success message', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[3].expertId
            }`
        )
        cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getSherlock().should('be.visible')
        expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
        expertInvitePage.selectProjectField(projectName)
        cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        expertInvitePage.getExpertInviteButton().contains('Confirmed').invoke('show').click({ force: true })
        cy.waitForLoadingDisappear()
        expertInvitePage.getSherlockWarning().should('contain', expertDetails.sherlockContactNotAllowed.replace('expertEmailAddress', createdExperts[3].email))
        expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment.replace('expertName', createdExperts[3].fullName))
        expertInvitePage.getExpertSherlockCommentOkButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
    })

    it('should select Add & set reply to NOT CONTACTED and verify success message', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[4].expertId
            }`
        )
        cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getSherlock().should('be.visible')
        expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
        expertInvitePage.selectProjectField(projectName)
        cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        expertInvitePage.getExpertInviteButton().contains('Not Contacted').invoke('show').click({ force: true })
        cy.waitForLoadingDisappear()
        expertInvitePage.getSherlockWarning().should('contain', expertDetails.sherlockContactNotAllowed.replace('expertEmailAddress', createdExperts[4].email))
        expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment.replace('expertName', createdExperts[4].fullName))
        expertInvitePage.getExpertSherlockCommentOkButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
    })

    it('should select 1-Click Invite success message', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/expert-search/expert/${createdExperts[5].expertId
            }`
        )
        cy.wait('@waitToLoadList').its('response.statusCode').should('eq', 200)
        expertDetailsPage.getSherlock().should('be.visible')
        expertInvitePage.getExpertInvitePreventMessage().should('have.text', 'Select active project to allow invite options.')
        expertInvitePage.selectProjectField(projectName)
        cy.wait('@waitForbulkValidate').its('response.statusCode').should('eq', 200)
        cy.waitForLoadingDisappear()
        expertInvitePage.selectExpertSegmentField()
        expertInvitePage.getExpertInviteButton().contains('1-Click Invite').click()
        cy.waitForLoadingDisappear()        
        expertInvitePage.getSherlockWarning().should('contain', expertDetails.sherlockContactNotAllowed.replace('expertEmailAddress', createdExperts[5].email))
        expertInvitePage.getExpertSherlockCommentTextarea().type(expertDetails.sherlockBreachComment.replace('expertName', createdExperts[5].fullName))
        expertInvitePage.getExpertSherlockCommentOkButton().click()
        cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
        expertInvitePage.getExpertInvitePreventMessage().should('include.text', 'EPL for this expert already exists.')
    })

    it('should verify experts pipeline data', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project-search`)
        globalPage.searchAnythingAndSelectValue(projectName)
        cy.waitForLoadingDisappear()
        expertInvitePage.getExpertsPipelineButton().click()

        cy.verifyExpertReplyStatus(createdExperts[0].fullName, 'Invited')
        cy.verifyExpertReplyStatus(createdExperts[1].fullName, 'Interested')
        cy.verifyExpertReplyStatus(createdExperts[2].fullName, 'Applied')
        cy.verifyExpertReplyStatus(createdExperts[3].fullName, 'Confirmed')
        cy.verifyExpertReplyStatus(createdExperts[4].fullName, 'Not contacted')
        cy.verifyExpertReplyStatus(createdExperts[5].fullName, 'Invited')
    })

    //TODO
    it.skip('ERM checks compliance breach page for the added breach experts', function () {
        cy.requestLogIn(
            testUsers.erm.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
        ).then(loginResponse => {
            authToken = loginResponse.body.token
            cy.setLocalStorageLoginInfo(
                loginResponse.body.user,
                loginResponse.body.token
            )

            cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/compliance-breach')
        })
    })
})


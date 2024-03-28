/* eslint-disable no-loop-func */
import GlobalPage from '../../../pageObjects/GlobalPage'
import FeePage from '../../../pageObjects/FeePage'
import InvoicePage from '../../../pageObjects/InvoicePage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import generator from '../../../support/generator'
import { random } from 'faker'
import { glob } from 'glob'
describe('Mckinsey receiving invoice', { tags: "mckinsey" }, function () {
    let projectDetails,
        feeId

    const scheduling = new AvailabilitiesAndScheduling()
    const globalPage = new GlobalPage()
    const feePage = new FeePage()
    const invoicePage = new InvoicePage()
    const projectName = `${generator.generateTestName()} McKinsey project`
    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()

    const expertData = {
        firstName: firstName,
        lastName: lastName,
        originalName: `${firstName} ${lastName}`,
        email: `${firstName + lastName}@mail.com`
    }

    const projectData = {
        project_name: projectName,
        workstream_name: `${projectName} workstream`,
        expert_original_name: expertData.originalName,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        startAt: generator.generateDateAddMinutesLater(45),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'EUR'
    }

    before(function () {
        cy.fixture('projectDetails').then(projectDetailsFixture => {
            projectDetails = projectDetailsFixture
        })

        cy.createMckinseyProjectWithExpertInStatus('accountManager', projectData, expertData, 'completed')

        cy.fixture('testUsers').then(testUsers => {
            cy.requestLogIn(
                testUsers.accounting.emailAddress,
                Cypress.env('CYPRESS_USER_PASSWORD')
            ).then(loginResponse => {

                cy.clearLocalAndSessionStorage()
                cy.setLocalStorageLoginInfo(loginResponse.body.user, loginResponse.body.token)

                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/experts-pipeline`)
                globalPage.getHeaderUserName().should('have.text', loginResponse.body.user.fullName)

            })
        })

        cy.waitForLoadingDisappear()
        cy.wait(500)
        cy.checkEPLStatusForCapi(expertData.originalName, 'Interviewed')
    })

    it('should check that accounting can create the bundle and generate the invoice details', function () {
        cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/fee`).as('postFeeCall')
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/create-platform-invoice`).as('postCAPICreatePlatformInvoice')

        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/invoice`)
        invoicePage.getUpdateDefaultProjectInvoicingEntity().click()
        invoicePage.getSelectInvoicingEntityDropdown().click()
        invoicePage.getSelectInvoicingEntity().type("{enter}")
        globalPage.submitButton().click()
        globalPage.getNotificationTitle().should('contain.text', 'Success')

        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/experts-pipeline`)
        scheduling.getCreateBundleButton().click()
        scheduling.getCurrencyTypeFieldList().first().should('have.text', projectData.feeCurrency)
        scheduling.getInterviewDurationField().should('have.value', projectDetails.interviewDuration)
        scheduling.getFeeValueAmountOnBundle().should('have.value', projectData.fee)
        scheduling.getHonorariumExpertName().should('have.value', expertData.originalName)
        scheduling.getCurrencyTypeFieldList().last().should('have.text', projectData.feeCurrency)
        scheduling.getHonorariumCostValue().should('have.value', projectDetails.honorariumAmount)
        scheduling.getConfirmInterviewButton().click()
        globalPage.getNotificationTitle().should('contain.text', 'Saved')

        cy.wait('@postFeeCall').its('response').then(postFeeResponse => {
            expect(postFeeResponse.statusCode).to.eq(200)

            feeId = postFeeResponse.body.id

            cy.wait('@postCAPICreatePlatformInvoice').its('response').then(postInvoiceResponse => {
                expect(postInvoiceResponse.statusCode).to.eq(200)

                globalPage.getNotificationMessage().should('contain.text', 'Hon. & Fee Bundle succeeded.')
                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/fee/${feeId}`)
                feePage.getEditButton().click()

                feePage.getFeeFormNotificationMessages().should('have.length', 2)
                feePage.getFeeFormNotificationMessages().first().should('contain.text', projectDetails.feeAssociatedToInvoiceEditableMessage)
                feePage.getFeeFormNotificationMessages().last().should('contain.text', projectDetails.feeAssociatedToENSCallOnlyInvoiceMessage)

                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/invoice`)
                invoicePage.getInvoiceLink().click()

                globalPage.getStatusLabel().should('have.length', 3)
                globalPage.getStatusLabel().first().should('contain.text', 'Draft')
                globalPage.getStatusLabel().last().should('contain.text', 'ENS API calls only')
            })
        })
    })
})

/* eslint-disable no-loop-func */
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import InvoicePage from '../../../pageObjects/InvoicePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey receiving invoice', { tags: "mckinsey" }, function () {
    let projectDetails

    const expertPipelinePage = new ExpertPipelinPage()
    const scheduling = new AvailabilitiesAndScheduling()
    const globalPage = new GlobalPage()
    const fasterSchedulingPage = new FasterSchedulingPage()
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
        project_location: {
            "address": "Av. Leandro N. Alem 855, Piso 24, Buenos Aires, C1001AAD, ARG, Argentina",
            "country": "Argentina",
            "name": "McKinsey & Company Argentina"
        },
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        startAt: generator.generateDateAddMinutesLater(45),
        fee: random.number(2000),
        feeCurrency: 'GBP'
    }

    before(function () {
        cy.fixture('projectDetails').then(projectDetailsFixture => {
            projectDetails = projectDetailsFixture
        })

        cy.createMckinseyProjectWithExpertInStatus('associate', projectData, expertData)
        cy.checkEPLStatus(expertData.originalName, 'Submitted')

        expertPipelinePage.clickMckButtonByName('Schedule')

        fasterSchedulingPage.selectMeetingType('None')

        fasterSchedulingPage
            .getConfirmSlotButton()
            .should('be.visible')
            .click()

        globalPage.getNotificationTitle()
            .should('contain.text', 'Success!')
        globalPage.getNotificationMessage()
            .should('contain.text', 'Schedule Updated')

        cy.waitForLoadingDisappear()

        cy.checkEPLStatusForCapi(expertData.originalName, 'Scheduled')

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
    })

    it('should check that accounting can create the bundle for a non-call_id epl', function () {
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/invoice/update-status`).as('postCAPIInvoiceUpdate')
        cy.intercept('POST', `${Cypress.env('CAPI_TEST_URL')}/create-platform-invoice`).as('postCAPICreatePlatformInvoice')

        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/invoice`)
        invoicePage.getUpdateDefaultProjectInvoicingEntity().click()
        invoicePage.getSelectInvoicingEntityDropdown().click()
        invoicePage.getSelectInvoicingEntity().click().type("McKinsey & Company Argentina")
        cy.wait(500)
        invoicePage.getClickInvoicingEntity().click({force: true})
        globalPage.submitButton().click()
        globalPage.getNotificationTitle().should('contain.text', 'Success')
        cy.reload()
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/experts-pipeline`)

        cy.changeEPLStatus(expertData.originalName, 'Interviewed')
        scheduling.getConfirmInterviewButton().click()
        scheduling.getCurrencyTypeFieldList().first().should('have.text', projectData.feeCurrency)
        scheduling.getInterviewDurationField().should('have.value', projectDetails.interviewDuration)
        scheduling.getFeeValueAmountOnBundle().should('have.value', projectData.fee)
        scheduling.getHonorariumExpertName().should('have.value', expertData.originalName)
        scheduling.getCurrencyTypeFieldList().last().should('have.text', projectDetails.honorariumCurrency)
        scheduling.getHonorariumCostValue().should('have.value', projectDetails.honorariumAmount)
        scheduling.getConfirmInterviewButton().click()
        globalPage.getNotificationTitle().should('contain.text', 'Saved')

        cy.wait('@postCAPICreatePlatformInvoice').its('response').then(postInvoiceResponse => {
            expect(postInvoiceResponse.statusCode).to.eq(200)

            globalPage.getNotificationMessage().should('contain.text', 'Hon. & Fee Bundle succeeded.')
            cy.checkEPLStatus(expertData.originalName, 'Interviewed')

            cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/invoice`)
            invoicePage.getInvoiceLink().click()

            globalPage.getStatusLabel().should('have.length', 2)
            globalPage.getStatusLabel().first().should('contain.text', 'Draft')
            globalPage.getStatusLabel().last().should('contain.text', 'ENS Invoice')
            invoicePage.getInvoicingEntity().should('contain.text', 'McKinsey & Company Argentina')

            invoicePage.getApproveBtn().click()
            invoicePage.getApproveConfirmBtn().click()
            globalPage.getNotificationTitle().should('have.text', 'Success!')

            globalPage.getStatusLabel().first().should('contain.text', 'Approved')

            invoicePage.getCreateInvoice().click()
            invoicePage.getSendDate().click()
            invoicePage.getTodayDate().click()
            invoicePage.getDocumentDate().click()
            invoicePage.getTodayDate().click()
            globalPage.submitButton().click()

            cy.wait('@postCAPIInvoiceUpdate').its('response.statusCode').should('eq', 200)

            invoicePage.getStatusCreated().should('contain.text', 'Created')
        })
    })
})

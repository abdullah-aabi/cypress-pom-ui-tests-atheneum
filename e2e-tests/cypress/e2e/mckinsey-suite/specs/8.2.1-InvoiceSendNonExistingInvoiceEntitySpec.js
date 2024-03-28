/* eslint-disable no-loop-func */
import GlobalPage from '../../../pageObjects/GlobalPage'
import InvoicePage from '../../../pageObjects/InvoicePage'
import AvailabilitiesAndScheduling from '../../../pageObjects/AvailabilitiesAndSchedulingPage'
import generator from '../../../support/generator'
import { random } from 'faker'

describe('Mckinsey receiving invoice', { tags: "mckinsey" }, function () {
    let projectDetails

    const invoicePage = new InvoicePage()
    const scheduling = new AvailabilitiesAndScheduling()
    const globalPage = new GlobalPage()
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
            address: "Av. Leandro N. Alem 855, Piso 24, Zimbabwe, C1001AAD, ARG, Zimbabwe",
            country: "Zimbabwe",
            name: "McKinsey & Company Zimbabwe"
        },
        expert_original_name: expertData.originalName,
        mckinsey_message_id: `message_${generator.generateTestName()}`,
        startAt: generator.generateDateAddMinutesLater(45),
        mckinsey_call_id: generator.generateUniqueIDForClient(),
        fee: random.number(2000),
        feeCurrency: 'CNY'
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

    it('should check that accounting can create the bundle and send the invoice when no invoicing entity is specified', function () {
        scheduling.getCreateBundleButton().click()
        scheduling.getCurrencyTypeFieldList().first().should('have.text', projectData.feeCurrency)
        scheduling.getInterviewDurationField().should('have.value', projectDetails.interviewDuration)
        scheduling.getFeeValueAmountOnBundle().should('have.value', projectData.fee)
        scheduling.getHonorariumExpertName().should('have.value', expertData.originalName)
        scheduling.getCurrencyTypeFieldList().last().should('have.text', projectDetails.honorariumCurrency)
        scheduling.getHonorariumCostValue().should('have.value', projectDetails.honorariumAmount)
        scheduling.getConfirmInterviewButton().click()

        globalPage.getNotificationTitle().should('have.text', 'Error!')
        globalPage.getNotificationMessage().should('have.text', projectDetails.mckinseyInvoiceEntityMissingMessage)


        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectData.platform_project_id}/invoice`)
        invoicePage.getInvoiceLink().should('not.exist')
        invoicePage.getInvoiceInfoBox().should('have.text', projectDetails.mckinseyNoInvoiceEntityMessage)
    })
})

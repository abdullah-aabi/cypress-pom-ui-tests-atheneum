import GlobalPage from '../../../pageObjects/GlobalPage'
import generator from '../../../support/generator'
import ContractPage from '../../../pageObjects/ContractPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
const moment = require('moment')

describe('Create different contract type with different contract coverage', { tags: "regression" }, function () {
    let totalValueForNonPAYGProject, contractTestData, localStorage, authToken, testUsers, testData, totalValueProject, contractNamePAYGProject,
        contractNameNonPAYGProject, contractNameNonPAYGAccount, updatedTotalValueForNonPAYGProject, updatedTotalValue, updatedTotalValueAccount,
        contractNamePAYGAccount, totalValueAccount, totalValueForNonPAYGAccount, projectIdForContractAccount, expertFullName, projectId, eplId,
        eplIdForContractAccount, projectDetails, reportData
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const contractPage = new ContractPage()
    const globalPage = new GlobalPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const expertPipelinePage = new ExpertPipelinePage()
    const expertInvitePage = new ExpertInvitePage()
    const currentDate = generator.convertDateToFormat(new Date(), 'DDMMYYYY')

    function generateTotalCreditValue(creditAmountAndValue) {
        let number = new Number(creditAmountAndValue)
        return number.toLocaleString("de-DE")
    }

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
            cy.fixture('reportData').then(report => reportData = report)
            cy.fixture('testData').then(testdata => {
                testData = testdata
                expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName}`
                cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
                    projectCreateResponse => {
                        projectId = projectCreateResponse.body.id
                        cy.log(projectId)
                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName).then(
                            addAndInviteExpertToProjectFromAPIResponse => {
                                cy.log(addAndInviteExpertToProjectFromAPIResponse)
                                eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                                cy.log(eplId)
                            })
                    })
                cy.createProjectFromAPI(projectName, 'Expert Sessions', testUsers.accountManager.emailAddress, testData.contractOfficeName).then(
                    projectCreateResponse => {
                        projectIdForContractAccount = projectCreateResponse.body.id
                        cy.log(projectIdForContractAccount)
                        cy.addAndInviteExpertToProjectFromAPI(projectIdForContractAccount, expertFullName).then(
                            addAndInviteExpertToProjectFromAPIResponse => {
                                cy.log(addAndInviteExpertToProjectFromAPIResponse)
                                eplIdForContractAccount = addAndInviteExpertToProjectFromAPIResponse.body.id
                                cy.log(eplIdForContractAccount)
                            })
                    })

                    
                cy.requestLogIn(
                    testUsers.accountManager.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    authToken = quickLoginResponse.body.token
                    localStorage = quickLoginResponse.body
                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

                    cy.deleteAccountContractsByName(authToken, testData.contractParentAccountName)
                })
            })
        })
        cy.fixture('contractTestData').then(contractData => {
            contractTestData = contractData
        })
        cy.fixture('projectDetails').then(projectDetailsFixture => {
            projectDetails = projectDetailsFixture
        })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/contract-search`)
        cy.intercept('POST', `**/api/contract`).as('contractCreation')
        cy.intercept('POST', `**/api/contract/search`).as('contractSearch')
        cy.intercept('PUT', `**/api/contract/**`).as('updateContract')
        cy.intercept('POST', `**/api/project/**/pipeline`).as('pipeline')

    })

    // does not work on CI
    it.skip('Contracts Export ', function () {
        const currentTime = moment().utc().format('HHmm')
        cy.wait('@contractSearch').its('response.statusCode').should('eq', 200)
        globalPage.getActionButtonByName('Export').click()
        cy.parseXlsx(`cypress/downloads/contracts_${currentDate}_${currentTime}.xlsx`).then(report => {
            expect(report[0].data[1]).to.include('QAA-001-PAY')
    })
})
    it('should create/edit/delete PAYG contract type with contract coverage as specific projects', function () {
        contractPage.getCreateNewContractBtn().click()
        contractPage.selectParentAccountName(testData.parentAccountName)
        contractPage.selectAtheneumContractParty(contractTestData.atheneumContractParty)
        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' ' + testUsers.accountManager.lastName)
        contractPage.selectContractCoverage(contractTestData.contractCoverage)
        contractPage.selectAccountOrProject(projectName)
        contractPage.selectContractTypeForSpecific(contractTestData.contractType)
        contractPage.getSignedCheckbox().check()
        contractPage.selectStartEndDateForPAYG()
        contractPage.priceRangeFromField().should('be.visible').type(contractTestData.pricerangefromPAYG)
        contractPage.priceRangeToField().should('be.visible').type(contractTestData.pricerangetoPAYG)
        contractPage.selectUnlimitedTotalValue().check()
        contractPage.selectCurrency(contractTestData.currency)
        globalPage.submitButton().click()
        cy.wait('@contractCreation').its('response.statusCode').should('eq', 200)
        contractPage.getCreatedContractName()
            .then($el => {
                contractNamePAYGProject = $el.text().substring(0, 11)
                contractPage.getClientNameOnContractPage().should('have.text', testData.parentAccountName)
                contractPage.getAtheneumContractPartyOnContractPage().should('have.text', contractTestData.atheneumContractParty)
                contractPage.getSignedByOnContractPage().should('have.text', testUsers.accountManager.firstName + ' ' + testUsers.accountManager.lastName)
                contractPage.getContractCoverrageOnContractPage().should('have.text', contractTestData.contractCoverage)
                contractPage.getSpecificProjectOrAccount().should('have.text', projectName)
                contractPage.getContractType().should('have.text', contractTestData.contractType + ' ' + contractTestData.contractTypeStatus)
                contractPage.getSignedStatus().should('have.text', 'yes')
                contractPage.getTotalValue().should('have.text', 'unlimited')
                contractPage.getPriceRange().should('include.text', contractTestData.pricerangefromPAYG)
                contractPage.getPriceRange().should('include.text', contractTestData.pricerangetoPAYG)
                contractPage.getPriceRange().should('include.text', contractTestData.currency)
                contractPage.getSpecificProjectOrAccount().click()
                contractPage.gtProjectNameOnSideBar().click()
                projectDetailsPage.getApplicableContracts().should('include.text', contractNamePAYGProject)
            })
        expertInvitePage.getExpertsPipelineButton().click()
        cy.wait('@pipeline').its('response.statusCode').should('eq', 200)
        cy.clickEplExpertToExpand(expertFullName)
        expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
        cy.verifyNotificationAndClose()
        expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
        expertPipelinePage
            .getIconForFeeDescription()
            .should('be.visible')
            .click()
        cy.verifyNotificationAndClose()
        projectDetailsPage.getApplicableContracts().click()
        projectDetailsPage.getContractNameOnSideBar().click()

        //Edit contract PAYG for specific project
        contractPage.getEditIcon().click()
        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' Admin')
        contractPage.priceRangeFromField().should('be.visible').clear().type(contractTestData.updatedPricerangefromPAYG)
        contractPage.priceRangeToField().should('be.visible').clear().type(contractTestData.updatedPricerangetoPAYG)
        contractPage.selectCurrency(contractTestData.updatedCurrency)
        globalPage.submitButton().click()
        cy.wait('@updateContract').its('response.statusCode').should('eq', 200)
        contractPage.getSignedByOnContractPage().should('have.text', testUsers.accountManager.firstName + ' Admin')
        contractPage.getPriceRange().should('include.text', contractTestData.updatedPricerangefromPAYG)
        contractPage.getPriceRange().should('include.text', contractTestData.updatedPricerangetoPAYG)
        contractPage.getPriceRange().should('include.text', contractTestData.updatedCurrency)

        // Delete Contract PAYG for specific project
        contractPage.getDeleteIcon().click()
        contractPage.getDeleteConfirmation().click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', contractTestData.deleteContractMessage)
        cy.wait('@contractSearch').its('response.statusCode').should('eq', 200)
    })

    it('should create/edit/delete non-PAYG contract type with contract coverage as specific projects', function () {
        contractPage.getCreateNewContractBtn().click()
        contractPage.selectParentAccountName(testData.parentAccountName)
        contractPage.selectAtheneumContractParty(contractTestData.atheneumContractParty)
        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' ' + testUsers.accountManager.lastName)
        contractPage.selectContractCoverage(contractTestData.contractCoverage)
        contractPage.selectAccountOrProject(projectName)
        contractPage.selectContractTypeForSpecific(contractTestData.contractTypeAsNonPAYG)
        contractPage.getSignedCheckbox().check()
        contractPage.selectStartEndDateForPAYG()
        contractPage.getCreditsForNonPAYG().type(contractTestData.creditsForNonPAYG)
        contractPage.getCreditValueForNonPAYG().type(contractTestData.creditValue)
        totalValueProject = generateTotalCreditValue(contractTestData.creditsForNonPAYG * contractTestData.creditValue)
        contractPage.selectCurrency(contractTestData.currency)
        contractPage.getTotalValueForNonPAYG()
            .should('be.visible')
            .then($el => {
                totalValueForNonPAYGProject = $el.text()
                expect(totalValueForNonPAYGProject).to.include(contractTestData.currency)
                expect(totalValueForNonPAYGProject).to.include(totalValueProject)
            })
        globalPage.submitButton().click()
        cy.wait('@contractCreation').its('response.statusCode').should('eq', 200)
        contractPage.getCreatedContractName()
            .then($el => {
                contractNameNonPAYGProject = $el.text().substring(0, 11)
                contractPage.getClientNameOnContractPage().should('have.text', testData.parentAccountName)
                contractPage.getAtheneumContractPartyOnContractPage().should('have.text', contractTestData.atheneumContractParty)
                contractPage.getSignedByOnContractPage().should('have.text', testUsers.accountManager.firstName + ' ' + testUsers.accountManager.lastName)
                contractPage.getContractCoverrageOnContractPage().should('have.text', contractTestData.contractCoverage)
                contractPage.getSpecificProjectOrAccount().should('have.text', projectName)
                contractPage.getContractType().should('have.text', contractTestData.contractTypeAsNonPAYG + ' ' + contractTestData.contractTypeStatus)
                contractPage.getSignedStatus().should('have.text', 'yes')
                contractPage.getTotalValue().should('include.text', contractTestData.creditsForNonPAYG)
                contractPage.getPriceRange().should('include.text', contractTestData.creditValue)
                contractPage.getPriceRange().should('include.text', contractTestData.currency)
                contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', contractTestData.currency)
                contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', totalValueProject)
                contractPage.getSpecificProjectOrAccount().click()
                contractPage.gtProjectNameOnSideBar().click()
                projectDetailsPage.getApplicableContracts().should('include.text', contractNameNonPAYGProject)
            })
        expertInvitePage.getExpertsPipelineButton().click()
        cy.wait('@pipeline').its('response.statusCode').should('eq', 200)
        cy.clickEplExpertToExpand(expertFullName)
        expertPipelinePage.getFeeAmountField()
            .should('have.attr', 'title', contractTestData.titleForNonEditableFee)
        projectDetailsPage.getApplicableContracts().click()
        projectDetailsPage.getContractNameOnSideBar().click()

        // Edit contract non-PAYG for specific project
        contractPage.getEditIconForNonPAYG().click()
        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' Admin')
        contractPage.getCreditsForNonPAYG().clear().type(contractTestData.updatedCreditsForNonPAYG)
        updatedTotalValue = generateTotalCreditValue(contractTestData.updatedCreditsForNonPAYG * contractTestData.creditValue)
        contractPage.selectCurrency(contractTestData.updatedCurrency)
        contractPage.getTotalValueForNonPAYG()
            .should('be.visible')
            .then($el => {
                updatedTotalValueForNonPAYGProject = $el.text()
                expect(updatedTotalValueForNonPAYGProject).to.include(contractTestData.updatedCurrency)
                expect(updatedTotalValueForNonPAYGProject).to.include(updatedTotalValue)
            })
        globalPage.submitButton().click()
        cy.wait('@updateContract').its('response.statusCode').should('eq', 200)
        contractPage.getTotalValue().should('include.text', contractTestData.updatedCreditsForNonPAYG)
        contractPage.getPriceRange().should('include.text', contractTestData.updatedCurrency)
        contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', contractTestData.updatedCurrency)
        contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', updatedTotalValue)

        // Delete Contract non-PAYG for specific project
        contractPage.getDeleteIcon().click()
        contractPage.getDeleteConfirmation().click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', contractTestData.deleteContractMessage)
        cy.wait('@contractSearch').its('response.statusCode').should('eq', 200)
    })

    it('should create PAYG contract type with contract coverage as specific accounts', function () {
        contractPage.getCreateNewContractBtn().click()
        contractPage.selectParentAccountName(testData.contractParentAccountName)
        contractPage.selectAtheneumContractParty(contractTestData.atheneumContractParty)
        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' Admin')
        contractPage.selectContractCoverage(contractTestData.contractCoverageForAccountLevel)
        contractPage.selectAccountOrProject(testData.contractAccountName)
        contractPage.selectContractTypeForSpecific(contractTestData.contractType)
        contractPage.getSignedCheckbox().check()
        contractPage.selectStartEndDateForPAYG()
        contractPage.priceRangeFromField().should('be.visible').type(contractTestData.pricerangefromPAYG)
        contractPage.priceRangeToField().should('be.visible').type(contractTestData.pricerangetoPAYG)
        contractPage.selectUnlimitedTotalValue().check()
        contractPage.selectCurrency(contractTestData.currency)
        globalPage.submitButton().click()
        cy.wait('@contractCreation').its('response.statusCode').should('eq', 200)
        contractPage.getCreatedContractName()
            .then($el => {
                contractNamePAYGAccount = $el.text().substring(0, 11)
                contractPage.getClientNameOnContractPage().should('have.text', testData.contractParentAccountName)
                contractPage.getAtheneumContractPartyOnContractPage().should('have.text', contractTestData.atheneumContractParty)
                contractPage.getSignedByOnContractPage().should('have.text', testUsers.accountManager.firstName + ' Admin')
                contractPage.getContractCoverrageOnContractPage().should('have.text', contractTestData.contractCoverageForAccountLevel)
                contractPage.getSpecificProjectOrAccount().should('have.text', testData.contractAccountName)
                contractPage.getContractType().should('have.text', contractTestData.contractType + ' ' + contractTestData.contractTypeStatus)
                contractPage.getSignedStatus().should('have.text', 'yes')
                contractPage.getTotalValue().should('have.text', 'unlimited')
                contractPage.getPriceRange().should('include.text', contractTestData.pricerangefromPAYG)
                contractPage.getPriceRange().should('include.text', contractTestData.pricerangetoPAYG)
                contractPage.getPriceRange().should('include.text', contractTestData.currency)
                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectIdForContractAccount}/experts-pipeline`)
                cy.wait('@pipeline').its('response.statusCode').should('eq', 200)
                projectDetailsPage.getApplicableContracts().should('include.text', contractNamePAYGAccount)
            })
        cy.wait(1000)
        expertPipelinePage.getEPL().click()
        expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
        cy.verifyNotificationAndClose()
        expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
        expertPipelinePage
            .getIconForFeeDescription()
            .should('be.visible')
            .click()
        cy.verifyNotificationAndClose()
        projectDetailsPage.getApplicableContracts().click()
        projectDetailsPage.getContractNameOnSideBar().click()

        // Delete Contract PAYG for specific account
        contractPage.getDeleteIcon().click()
        contractPage.getDeleteConfirmation().click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', contractTestData.deleteContractMessage)
        cy.wait('@contractSearch').its('response.statusCode').should('eq', 200)
    })

    it('should create Non-PAYG contract type with contract coverage as specific accounts', function () {
        contractPage.getCreateNewContractBtn().click()
        contractPage.selectParentAccountName(testData.contractParentAccountName)
        contractPage.selectAtheneumContractParty(contractTestData.atheneumContractParty)
        contractPage.selectSignedBy(testUsers.accountManager.firstName + ' Admin')
        contractPage.selectContractCoverage(contractTestData.contractCoverageForAccountLevel)
        contractPage.selectAccountOrProject(testData.contractAccountName)
        contractPage.selectContractTypeForSpecific(contractTestData.contractTypeAsNonPAYG)
        contractPage.getSignedCheckbox().check()
        contractPage.selectStartEndDateForPAYG()
        contractPage.getCreditsForNonPAYG().type(contractTestData.creditsForNonPAYG)
        contractPage.getCreditValueForNonPAYG().type(contractTestData.creditValue)
        totalValueAccount = generateTotalCreditValue(contractTestData.creditsForNonPAYG * contractTestData.creditValue)
        contractPage.selectCurrency(contractTestData.currency)
        contractPage.getTotalValueForNonPAYG()
            .should('be.visible')
            .then($el => {
                totalValueForNonPAYGAccount = $el.text()
                expect(totalValueForNonPAYGAccount).to.include(contractTestData.currency)
                expect(totalValueForNonPAYGAccount).to.include(totalValueAccount)
            })
        globalPage.submitButton().click()
        cy.wait('@contractCreation').its('response.statusCode').should('eq', 200)
        contractPage.getCreatedContractName()
            .then($el => {
                contractNameNonPAYGAccount = $el.text().substring(0, 11)
                contractPage.getClientNameOnContractPage().should('have.text', testData.contractParentAccountName)
                contractPage.getAtheneumContractPartyOnContractPage().should('have.text', contractTestData.atheneumContractParty)
                contractPage.getSignedByOnContractPage().should('include.text', testUsers.accountManager.firstName + ' Admin')
                contractPage.getContractCoverrageOnContractPage().should('have.text', contractTestData.contractCoverageForAccountLevel)
                contractPage.getSpecificProjectOrAccount().should('have.text', testData.contractAccountName)
                contractPage.getContractType().should('have.text', contractTestData.contractTypeAsNonPAYG + ' ' + contractTestData.contractTypeStatus)
                contractPage.getSignedStatus().should('have.text', 'yes')
                contractPage.getTotalValue().should('include.text', contractTestData.creditsForNonPAYG)
                contractPage.getPriceRange().should('include.text', contractTestData.creditValue)
                contractPage.getPriceRange().should('include.text', contractTestData.currency)
                contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', contractTestData.currency)
                contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', totalValueAccount)
                cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectIdForContractAccount}/experts-pipeline`)
                cy.wait('@pipeline').its('response.statusCode').should('eq', 200)
                projectDetailsPage.getApplicableContracts().should('include.text', contractNameNonPAYGAccount)
            })
        expertPipelinePage.getEPL().click()
        expertPipelinePage.getFeeAmountField()
            .should('have.attr', 'title', contractTestData.titleForNonEditableFee)
        projectDetailsPage.getApplicableContracts().click()
        projectDetailsPage.getContractNameOnSideBar().click()

        //Edit contract non-PAYG for specific project
        contractPage.getEditIconForNonPAYG().click()
        contractPage.getCreditsForNonPAYG().clear().type(contractTestData.updatedCreditsForNonPAYG)
        updatedTotalValueAccount = generateTotalCreditValue(contractTestData.updatedCreditsForNonPAYG * contractTestData.creditValue)
        contractPage.selectCurrency(contractTestData.updatedCurrency)
        contractPage.getTotalValueForNonPAYG()
            .should('be.visible')
            .then($el => {
                updatedTotalValueForNonPAYGProject = $el.text()
                expect(updatedTotalValueForNonPAYGProject).to.include(contractTestData.updatedCurrency)
                expect(updatedTotalValueForNonPAYGProject).to.include(updatedTotalValueAccount)
            })
        globalPage.submitButton().click()
        cy.wait('@updateContract').its('response.statusCode').should('eq', 200)
        contractPage.getTotalValue().should('include.text', contractTestData.updatedCreditsForNonPAYG)
        contractPage.getPriceRange().should('include.text', contractTestData.updatedCurrency)
        contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', contractTestData.updatedCurrency)
        contractPage.getTotalValueForNonPAYGOnContractDetails().should('include.text', updatedTotalValueAccount)

        // Delete Contract non-PAYG for specific project
        contractPage.getDeleteIcon().click()
        contractPage.getDeleteConfirmation().click()
        globalPage.getNotificationTitle().should('have.text', 'Success!')
        globalPage.getNotificationMessage().should('have.text', contractTestData.deleteContractMessage)
        cy.wait('@contractSearch').its('response.statusCode').should('eq', 200)
    })
})

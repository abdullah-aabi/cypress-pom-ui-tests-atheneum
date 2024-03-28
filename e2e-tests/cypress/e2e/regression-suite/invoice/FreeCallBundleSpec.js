import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import ProjectOutcomePage from '../../../pageObjects/ProjectOutcomePage'
import FeePage from '../../../pageObjects/FeePage'

describe('Creating bundle for Free call', { tags: ["regression", "smoke"] }, function () {
    let testUsers,
        projectId,
        localStorage,
        projectDetails,
        eplId,
        segmentId,
        authToken,
        costsTestData,
        marginValueForFreeCall,
        marginPercentageForDiscountFeeFreeCall,
        marginValueForDiscountFeeFreeCall,
        totalCost,
        totalMargin,
        totalMarginPercentage,
        expertTitle,
        expertFullName

    let expertData = generator.generateExpertNames(1)[0]

    const uniqueid = `${generator.generateUniqueIDForClient()}`
    const todaysDate = `${generator.returnDateinYYYYMMDDFormat()}`
    const startTime = `${generator.startTimeForRescheduleSlot()}`
    const endTime = `${generator.endTimeForRescheduleSlotOfOneHour()}`
    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const expertInvitePage = new ExpertInvitePage()
    const globalPage = new GlobalPage()
    const expertPipelinePage = new ExpertPipelinPage()
    const projectOutcomePage = new ProjectOutcomePage()
    const feePage = new FeePage()


    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
        })

        cy.fixture('costsTestData').then(costTestData => {
            costsTestData = costTestData
            marginValueForDiscountFeeFreeCall = costsTestData.feeValue - costsTestData.costValue
            marginPercentageForDiscountFeeFreeCall = Math.round((marginValueForDiscountFeeFreeCall * 100) / costsTestData.feeValue)
            marginValueForFreeCall = 0 - costsTestData.costValue

            totalCost = costsTestData.feeValue + costsTestData.costValue
            totalMargin = costsTestData.feeValue - totalCost
            totalMarginPercentage = Math.round((totalMargin * 100) / costsTestData.feeValue)
        })

        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('projectDetails').then(projectDetailsFixture => {
                    projectDetails = projectDetailsFixture
                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(quickLoginResponse => {
                        authToken = quickLoginResponse.body.token
                        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                            expertCreateObject.firstName = expertData.firstName
                            expertCreateObject.lastName = expertData.lastName
                            expertCreateObject.originalName = expertData.originalName
                            expertCreateObject.email = expertData.email
                            cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                                expertCreateResponse => {
                                    expertData.expertId = expertCreateResponse.body.id
                                    expertTitle = expertCreateResponse.body.title
                                    expertFullName = expertCreateResponse.body.originalName
                                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                                        addAndInviteExpertToProjectFromAPIResponse => {
                                            eplId = addAndInviteExpertToProjectFromAPIResponse.body.id

                                            // Add Fee and hono
                                            cy.fixture('objects/eplExpandedObject').then(eplRequestData => {
                                                eplRequestData.segmentId = segmentId
                                                eplRequestData.honorarium = projectDetails.honorariumAmount
                                                eplRequestData.fee = projectDetails.feeAmountField
                                                cy.requestPutEPLExpanded(authToken, eplId, eplRequestData)

                                                // Change EPL to submitted 
                                                cy.requestGetEPL(authToken, eplId).then(eplRequestDataResponse => {
                                                    eplRequestDataResponse.body.eplStatusId = 5
                                                    eplRequestDataResponse.body.relevantExperience.experience.company = eplRequestDataResponse.body.relevantExperience.experience.company.name
                                                    eplRequestDataResponse.body.relevantExperience.experience.position = eplRequestDataResponse.body.relevantExperience.experience.position.name
                                                    cy.requestPutEPL(authToken, eplId, eplRequestDataResponse.body)

                                                    //Schedule without zoom
                                                    cy.fixture('objects/scheduleWithoutZoomObject').then(scheduleWithoutZoom => {
                                                        scheduleWithoutZoom.eplId = eplId
                                                        scheduleWithoutZoom.timeslots[0].id = uniqueid
                                                        scheduleWithoutZoom.timeslots[0].time.start = parseInt(startTime)
                                                        scheduleWithoutZoom.timeslots[0].time.end = parseInt(endTime)
                                                        cy.requestCreateAvailabilityAndTimeslot(authToken, scheduleWithoutZoom)

                                                        //Change to intetviewed
                                                        cy.requestGetEPL(authToken, eplId).then(eplRequestResponse => {
                                                            eplRequestResponse.body.eplStatusId = 10
                                                            eplRequestResponse.body.relevantExperience.experience.company = eplRequestResponse.body.relevantExperience.experience.company.name
                                                            eplRequestResponse.body.relevantExperience.experience.position = eplRequestResponse.body.relevantExperience.experience.position.name
                                                            eplRequestResponse.body.interviewDate = todaysDate
                                                            cy.requestPutEPL(authToken, eplId, eplRequestResponse.body)
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                }
                            )
                        })

                        cy.setLocalStorageLoginInfo(quickLoginResponse.body.user, quickLoginResponse.body.token)
                        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`)
                        cy.waitForLoadingDisappear()
                    })
                    cy.checkEPLStatus(expertData.originalName, 'Interviewed')
                    expertInvitePage.getDateOnEpl().should('be.visible')
                })

                cy.requestLogIn(
                    testUsers.accounting.emailAddress,
                    Cypress.env('CYPRESS_USER_PASSWORD')
                ).then(quickLoginResponse => {
                    localStorage = quickLoginResponse.body
                    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                })
            })
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('POST', '**/api/invoice').as('postInvoiceCall')
        cy.intercept('PUT', '**/request-approval').as('putRequestApprovalInvoiceCall')
        cy.intercept('PUT', '**/api/invoice/*').as('putEditInvoiceCall')
        cy.intercept('PUT', '**/disapprove').as('putDisapproveInvoiceCall')
        cy.intercept('DELETE', '**/api/invoice/*').as('deleteInvoiceCall')
        cy.intercept('PUT', '**/approve').as('putApproveInvoiceCall')
        cy.intercept('PUT', '**/created-status').as('putCreateInvoiceCall')
        cy.intercept('POST', '**/send-invoice').as('postSendInvoiceCall')
        cy.intercept('POST', '**/credit-note').as('postCreateCreditNoteCall')
        cy.intercept('GET', '**/api/employee/**').as('getEmployee')
    })

    it('Should create bundle for free call from EPL, proposal discount Fee and automatic Free call cost', function () {
        expertPipelinePage.getBundleCreate().click()
        cy.waitForLoadingDisappear()
        expertPipelinePage.getDialogHeader().should('contain.text', 'Hon. & Fee Bundle')
        projectOutcomePage.getFreeCallOption().check()
        projectOutcomePage.getFeeTypeDropdown().should('have.text', 'Proposal/discount fee')
        projectOutcomePage.selectFeeCurrencyType(costsTestData.currencyType)
        projectOutcomePage.getFeeValueInput().clear().type(costsTestData.feeValue)
        projectOutcomePage.selectCostCurrencyOnBundleCreation(costsTestData.currencyType)
        projectOutcomePage.getCostValueInput().clear().type(costsTestData.costValue)
        projectOutcomePage.selectFreeCallType('Internal - Marketing (Free Call)')
        projectOutcomePage.getSaveCostButton().click()
        globalPage.getNotificationTitle().should('have.text', 'Saved')
    })

    it('Should verify bundle creation info for free call under outcome tab', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/outcome`)

        // Row created with Proposal/Discount Fee
        projectOutcomePage.getFeeValueForDiscountFeeFreeCall().should('contain', `${costsTestData.feeValue}.00`)
        projectOutcomePage.getCostValueForDiscountFeeFreeCall().should('have.text', `${costsTestData.costValue}.00`)
        projectOutcomePage.getMarginValueForDiscountFeeFreeCall().should('have.text', `${marginValueForDiscountFeeFreeCall}.00`)

        // Row created with internal Marketing / freecall
        projectOutcomePage.getCostValueForFreeCall().should('have.text', `${costsTestData.feeValue}.00`)
        projectOutcomePage.getFeeValueForFreeCall().should('contain', '-')
        //issue in margin AP-4755
        //projectOutcomePage.getMarginValueForFreeCall().should('have.text', `${marginValueForFreeCall}.00`)

        // Net Total
        projectOutcomePage.getTotalMargin().should('have.text', `${totalMargin}.00`)
        projectOutcomePage.getTotalCost().should('have.text', `${totalCost}.00`)
        projectOutcomePage.getTotalFee().should('have.text', `${costsTestData.feeValue}.00`)

        //Project metrics
        projectOutcomePage.getFeesMetricsValue().should('contain', `${costsTestData.feeValue}.00 €`)
        projectOutcomePage.getCostsMetricsValue().should('contain', `${totalCost}.00 €`)
        // issue in total margin AP-4755
        //projectOutcomePage.getGrossMarginMetricsValue().should('contain', `${totalMargin}.00 €`)
        //projectOutcomePage.getGrossMarginMetricsPercentage().should('contain', totalMarginPercentage)
    })

    it('Should verify proposal/discount fee under fee page', function () {
        projectOutcomePage.getProposalFee().click()
        feePage.getHeadingOnFeePage(2).should('include.text', 'Proposal/discount fee')
        feePage.getHeadingOnFeePage(2).should('include.text', expertTitle)
        feePage.getHeadingOnFeePage(2).should('include.text', expertFullName)
    })
})

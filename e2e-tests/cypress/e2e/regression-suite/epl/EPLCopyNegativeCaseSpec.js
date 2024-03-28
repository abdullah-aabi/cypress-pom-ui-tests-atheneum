
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import generator from '../../../support/generator'

describe('Bulk copying EPLs more than 20 ', { tags: "regression" }, function () {
    let projectDetails, authToken,
        projectId, employeeFullName, eplId

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const projectDetailsPage = new ProjectDetailsPage()
    let expertsData = generator.generateExpertNames(22)

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
        cy.clearLocalAndSessionStorage()
        cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
            projectCreateResponse => {
                projectId = projectCreateResponse.body.id

                cy.fixture('projectDetails').then(testData => projectDetails = testData)
                cy.fixture('testUsers').then(testUsers => {
                    employeeFullName = `${testUsers.associate.firstName} ${testUsers.associate.lastName}`

                    cy.requestLogIn(
                        testUsers.accountManager.emailAddress,
                        Cypress.env('CYPRESS_USER_PASSWORD')
                    ).then(loginResponse => {
                        cy.setLocalStorageLoginInfo(loginResponse.body.user, loginResponse.body.token)
                        authToken = loginResponse.body.token
                            for (let i = 0; i< expertsData.length; i++) {
                            cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
                                expertCreateObject.firstName = expertsData[i].firstName
                                expertCreateObject.lastName = expertsData[i].lastName
                                expertCreateObject.originalName = expertsData[i].originalName
                                expertCreateObject.email = expertsData[i].email
                                cy.requestCreateExpert(loginResponse.body.token, expertCreateObject).then(
                                    expertCreateResponse => {
                                        expertsData[i].expertId = expertCreateResponse.body.id
                                        expertsData[i].fullName = expertCreateObject.originalName
                                        cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                                            addAndInviteExpertToProjectFromAPIResponse => {
                                        eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                                        if (i === 20) {
                                            return false;
                                        }
                                        cy.requestGetEPL(authToken, eplId).then(eplRequestDataResponse => {
                                            eplRequestDataResponse.body.eplStatusId = 5
                                            eplRequestDataResponse.body.relevantExperience.experience.company = eplRequestDataResponse.body.relevantExperience.experience.company.name
                                            eplRequestDataResponse.body.relevantExperience.experience.position = eplRequestDataResponse.body.relevantExperience.experience.position.name
                                            cy.requestPutEPL(authToken, eplId, eplRequestDataResponse.body)  
                                            
                                    })
                            })
                        })
                        })
                        
                    }
                    })
                })
            }
        )
    })

    beforeEach(function () {
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${projectId}/pipeline`).as('Project')
    })

    it('should not be able to  copy ELPs with Recruitment status', function () {
        cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
        )
        cy.waitForLoadingDisappear()
        cy.wait(500)
        
        projectDetailsPage.getLastCheckBox().click()
        projectDetailsPage.getCopyExpertMouseHover().trigger('mouseover')
        projectDetailsPage.getToolTipText().then(tooltip => {
            expect(tooltip.text()).to.eql("Only EPLs with statuses Submitted, Requested, Scheduled and Interviewed can be copied")
        })
    })

    it('should not be able to bulk copy ELPs more than 20 with submitted status', function () {
    
        projectDetailsPage.getSubmitStatus().click({force:true})
        cy.wait('@Project')
        projectDetailsPage.getBulkSelect().click({force:true})
        projectDetailsPage.getCopyExpertMouseHover().trigger('mouseover')
        projectDetailsPage.getToolTipText().then(tooltip => {
            expect(tooltip.text()).to.eql("Maximum of 20 experts can be copied at one time")
        })
    })
})
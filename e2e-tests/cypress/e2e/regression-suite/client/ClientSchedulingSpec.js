import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ClientsAppPage from '../../../pageObjects/ClientsAppPage'

describe('Client Scheduling', { tags: ["regression", "smoke"] }, function () {
    let testUsers, projectDetails,
        fasterScheduling,
        authToken,
        localStorage,
        projectId,
        eplId, timeStamp

    // Enabling user to add 3 experts max in project
    let expertData = generator.generateExpertNames(3)[0]

    const projectName = `${generator.generateTestName()} Expert Sessions project`
    const startTimeForSlot = `${generator.startTimeForTomorrowSlotAvailability()}`
    const endTimeForSlot = `${generator.endTimeForTomorrowSlotAvailability()}`
    const uniqueidForClientSlot = `${generator.generateUniqueIDForClient()}`
    const uniqueidForExpertSlot = `${generator.generateUniqueIDForExpert()}`
    const uniqueidForClientScheduleSlot = `${generator.generateUniqueIDForClient()}`
    const uniqueidForExpertScheduleSlot = `${generator.generateUniqueIDForExpert()}`
    const uniqueidForSlot = `${generator.generateUniqueIDForScheduleSlot()}`

    const expertInvitePage = new ExpertInvitePage()
    const fasterSchedulingPage = new FasterSchedulingPage()
    const expertPipelinePage = new ExpertPipelinePage()
    const globalPage = new GlobalPage()
    const projectDetailsPage = new ProjectDetailsPage()
    const clientAppPage = new ClientsAppPage()

    let slotAvailableData = []
    let createdAvailableSlots = []
    let slotScheduleData = []
    let createdScheduledSlots = []

    slotAvailableData.push({
        startTimeForExpert: startTimeForSlot,
        fasterSchedulingPage: fasterSchedulingPage,
        endTimeForExpert: endTimeForSlot,
        startTimeForClient: startTimeForSlot,
        endTImeForClient: endTimeForSlot,
        uniqueidForClient: uniqueidForClientSlot,
        uniqueidForExpert: uniqueidForExpertSlot
    })

    slotScheduleData.push({
        startTimeForExpert: startTimeForSlot,
        endTimeForExpert: endTimeForSlot,
        startTimeForClient: startTimeForSlot,
        endTImeForClient: endTimeForSlot,
        uniqueidForClient: uniqueidForClientScheduleSlot,
        uniqueidForExpert: uniqueidForExpertScheduleSlot,
        uniqueidForSlot: uniqueidForSlot,
        slotScheduleStartTime: startTimeForSlot,
        slotScheduleEndTime: endTimeForSlot
    })

    before(function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)

        cy.clearLocalAndSessionStorage()
        cy.fixture('testUsers').then(testusers => {
            testUsers = testusers
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
                            // creating an expert with api
                            expertCreateObject.firstName = expertData.firstName
                            expertCreateObject.lastName = expertData.lastName
                            expertCreateObject.originalName = expertData.originalName
                            expertCreateObject.email = expertData.email
                            cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                                expertCreateResponse => {
                                    // sending invite to project 
                                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                                        addAndInviteExpertToProjectFromAPIResponse => {
                                            eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                                            cy.log(eplId)
                                            // set epl status to submit
                                            cy.requestPutEPL(authToken, eplId, { "eplStatusId": 5 })
                                        }
                                    )
                                }
                            )
                        })

                        localStorage = quickLoginResponse.body
                        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
                        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
                        expertInvitePage.getExpertsPipelineButton().click()
                    })
                })
                cy.fixture('fasterScheduling').then(fasterSchedulingFixture => {
                    fasterScheduling = fasterSchedulingFixture
                })
            }
        )
    })

    beforeEach(function () {
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.intercept('POST', `**/api/schedule/**/notify-clients`).as('notifyClient')
        cy.intercept('POST', `**/api/schedule/**/notify-expert`).as('notifyExpert')
        cy.intercept('POST', `**/api/project/**/zoom-meetings`).as('zoomMeeting')
    })

    it('Enable client authentication on project level', function () {
        cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
        cy.waitForLoadingDisappear()

        projectDetailsPage.getEditProjectSettingBtn().should('be.visible').click()
        cy.waitForLoadingDisappear()

        projectDetailsPage.getSettingsTitle().should('have.text', 'Edit settings')
        projectDetailsPage.getClientAuthenticationOption().click().should('have.value', 'true')
        projectDetailsPage.getClientSchedulingEnabled().click().should('have.value', 'true')
        globalPage.submitButton().should('be.enabled').click()
        cy.waitForLoadingDisappear()
        expertInvitePage.getExpertsPipelineButton().click()
        cy.waitForLoadingDisappear()
        cy.checkEPLStatus(expertData.originalName, 'Submitted')
    })

    it('Should schedule 30 min availability for expert from client interface', function () {

        // Adding avalaibility for expert with API in scheduling
        cy.wrap(slotAvailableData).each(slot => {
            cy.fixture('objects/addAvailableSlotObject').then(
                addAvailableSlotObject => {

                    addAvailableSlotObject.availabilities[1].id = slot.uniqueidForExpert
                    addAvailableSlotObject.availabilities[1].time.start = parseInt(
                        slot.startTimeForExpert
                    )

                    addAvailableSlotObject.availabilities[1].time.end = parseInt(
                        slot.endTimeForExpert
                    )
                    addAvailableSlotObject.eplId = eplId
                    cy.requestCreateAvailabilityAndTimeslot(
                        authToken,
                        addAvailableSlotObject
                    ).then(createAvailabilityAndTimeslotResponse => {
                        cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
                            createdAvailableSlots.push({
                                expertAvailabilityToEplsStartTime:
                                    requestGetEPLResponse.body.expertAvailabilityToEpls[0]
                                        .startTime,
                                expertAvailabilityToEplsEndTime:
                                    requestGetEPLResponse.body.expertAvailabilityToEpls[1].endTime
                            })
                            cy.log(requestGetEPLResponse.body.expertAvailabilityToEpls[0].startTime)
                        })
                        cy.requestCopyLink(authToken, projectId).then(link => {
                            cy.visit(link)
                            timeStamp = parseInt(slot.startTimeForExpert)

                            // Verifying expert's availability here
                            expertInvitePage.getCalendarAvailabilityText().should('contain.text', `Expert's availabilities`)
                            // Verifying Available date
                            expertInvitePage.getEplAvailabilityDate().should('contain.text', generator.returnDayDate(timeStamp))
                            // Verifying Available month
                            expertInvitePage.getEplAvailabilityDate().should('contain.text', generator.returnMonth(timeStamp))
                            // Verifying Available time
                            projectDetailsPage.getAvailableTimeSlot().should('contain.text', generator.returnTime(timeStamp)).click({ force: true })

                            globalPage.getPrimaryButton().click()
                            projectDetailsPage.getScheduleTimeMessage().should('contain.text', 'Generating a schedule')
                            cy.wait('@notifyExpert').its('response.statusCode').should('eq', 200)
                            cy.wait('@notifyClient').its('response.statusCode').should('eq', 200)
                            cy.waitForLoadingDisappear()
                            globalPage.getSecondaryButton().click()

                            // Going to schedule tab to verify if time scheduled
                            clientAppPage.getClientTabLink().contains('Scheduled').click()

                            cy.waitForLoadingDisappear()
                            clientAppPage.getEPLAction().should('contain.text', 'Scheduled on ');

                            expertInvitePage.getEplScheduledDateTime().should('contain.text', generator.returnMonthDD(timeStamp))
                            // Verifying Available time
                            expertInvitePage.getEplScheduledDateTime().should('contain.text', generator.returnTime(timeStamp))

                            // Verifying date and time after scheduling from client interface
                            cy.visit(
                                `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
                            )
                            cy.waitForLoadingDisappear()

                            expertInvitePage.getEplStatus().should('contain.text', 'Scheduled')

                            projectDetailsPage.getScheduleStatusDate().should('contain.text', generator.returnMonthDD(timeStamp))
                            projectDetailsPage.getScheduleStatusTime().should('contain.text', generator.returnTime(timeStamp))
                        })
                    })

                }
            )
        })

    })

    it('Should schedule 30 min availability for client and expert from client interface', function () {
        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = expertData.firstName
            expertCreateObject.lastName = expertData.lastName
            expertCreateObject.originalName = expertData.originalName
            expertCreateObject.email = expertData.email
            cy.requestCreateExpert(authToken, expertCreateObject).then(
                expertCreateResponse => {
                    cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                        addAndInviteExpertToProjectFromAPIResponse => {
                            eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                            cy.log(eplId)
                            cy.requestPutEPL(authToken, eplId, { "eplStatusId": 5 })
                        }
                    )
                }
            )
            cy.reload()
        })
        cy.wrap(slotAvailableData).each(slot => {
            cy.fixture('objects/addAvailableSlotObject').then(
                addAvailableSlotObject => {
                    addAvailableSlotObject.availabilities[1].id = slot.uniqueidForClient
                    addAvailableSlotObject.availabilities[1].time.start = parseInt(
                        slot.startTimeForClient
                    )
                    addAvailableSlotObject.availabilities[1].time.end = parseInt(
                        slot.endTImeForClient
                    )
                    addAvailableSlotObject.eplId = eplId
                    cy.requestCreateAvailabilityAndTimeslot(
                        authToken,
                        addAvailableSlotObject
                    ).then(createAvailabilityAndTimeslotResponse => {
                        cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
                            createdAvailableSlots.push({
                                expertAvailabilityToEplsEndTime:
                                    requestGetEPLResponse.body.expertAvailabilityToEpls[1].endTime
                            })
                        })
                    })
                    cy.waitForLoadingDisappear()
                    cy.requestCopyLink(authToken, projectId).then(link => {
                        cy.visit(link)
                        timeStamp = parseInt(slot.startTimeForClient)
                        // Verifying Available date
                        expertInvitePage.getEplAvailabilityDate().should('contain.text', generator.returnDayDate(timeStamp))
                        // Verifying Available month
                        expertInvitePage.getEplAvailabilityDate().should('contain.text', generator.returnMonth(timeStamp))
                        // Verifying Available time
                        projectDetailsPage.getAvailableTimeSlot().should('contain.text', generator.returnTime(timeStamp)).click({ force: true })

                        // Verifying expert and clients matched availability text here

                        expertInvitePage.getCalendarAvailabilityText().should('contain.text', `Your matched availabilities`)

                        globalPage.getPrimaryButton().click()
                        projectDetailsPage.getScheduleTimeMessage().should('contain.text', 'Generating a schedule')

                        cy.wait('@notifyExpert').its('response.statusCode').should('eq', 200)
                        cy.wait('@notifyClient').its('response.statusCode').should('eq', 200)

                        cy.waitForLoadingDisappear()
                        globalPage.getSecondaryButton().click()
                        clientAppPage.getClientTabLink().contains('Scheduled').click()
                        cy.waitForLoadingDisappear()
                        clientAppPage.getEPLAction().last().should('contain.text', 'Scheduled on ');

                        expertInvitePage.getEplScheduledDateTime().last().should('contain.text', generator.returnMonthDD(timeStamp))
                        // Verifying Available time
                        expertInvitePage.getEplScheduledDateTime().last().should('contain.text', generator.returnTime(timeStamp))

                        // Verifying date and time after scheduling from client interface
                        cy.visit(
                            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
                        )
                        cy.waitForLoadingDisappear()

                        projectDetailsPage.getScheduleStatusDate().last().should('contain.text', generator.returnMonthDD(timeStamp))
                        projectDetailsPage.getScheduleStatusTime().last().should('contain.text', generator.returnTime(timeStamp))
                    })
                }
            )
        })

    })

})
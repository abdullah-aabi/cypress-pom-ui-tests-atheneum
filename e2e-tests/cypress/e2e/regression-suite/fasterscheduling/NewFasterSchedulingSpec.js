import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import GlobalPage from '../../../pageObjects/GlobalPage'

describe('New Faster Scheduling', { tags: "regression" }, function () {
  let testUsers,
    projectDetails,
    fasterScheduling,
    authToken,
    localStorage,
    projectId,
    eplId,
    timeOnBar,
    dateOnCalender,
    startTimeReturnedForAvailability,
    endTimeReturnedForAvailability,
    dateReturnedForAvailability,
    dateinDDMMYYYYFormat,
    dateInNumber,
    dateofRescheduledSlot,
    rescheduledateinDDMMYYYYFormat,
    dateinFullMonthofRescheduledSlot,
    segmentId

  let expertData = generator.generateExpertNames(1)[0]

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
  let slotAvailableData = []
  let createdAvailableSlots = []
  let slotScheduleData = []
  let createdScheduledSlots = []

  slotAvailableData.push({
    startTimeForExpert: startTimeForSlot,
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
              expertCreateObject.firstName = expertData.firstName
              expertCreateObject.lastName = expertData.lastName
              expertCreateObject.originalName = expertData.originalName
              expertCreateObject.email = expertData.email
              cy.requestCreateExpert(quickLoginResponse.body.token, expertCreateObject).then(
                expertCreateResponse => {
                  cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                    addAndInviteExpertToProjectFromAPIResponse => {
                      eplId = addAndInviteExpertToProjectFromAPIResponse.body.id
                      segmentId = projectCreateResponse.body.segmentId
                      // Add Fee and hono
                      cy.fixture('objects/eplExpandedObject').then(eplRequestData => {
                        eplRequestData.segmentId = segmentId
                        eplRequestData.honorarium = projectDetails.honorariumAmount
                        eplRequestData.fee = projectDetails.feeAmountField
                        cy.requestPutEPLExpanded(authToken, eplId, eplRequestData)
                      })

                    }
                  )
                }
              )
            })

            localStorage = quickLoginResponse.body
            cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
            cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
            expertInvitePage.getExpertsPipelineButton().click()
            cy.waitForLoadingDisappear()
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

  it('Should show error when trying to schedle with EPL status Rcruitment', function () {
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    fasterSchedulingPage.getConfirmSlotButton().should('be.visible').click()
    globalPage.getNotificationTitle().contains('ERROR!')
    globalPage.getNotificationMessage().contains('Cannot Schedule EPL in status lower than Submitted!')
    fasterSchedulingPage.getCloseButton().should('be.visible').click()
    cy.changeEPLStatus(expertData.originalName, 'Submitted')
    expertPipelinePage.getEplStatusConfirmButton().click()
    cy.verifyNotificationAndClose()
    cy.checkEPLStatus(expertData.originalName, 'Submitted')
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
  })

  it('Should try to schedule a slot before current time, get proper error message', function () {
    cy.waitForLoadingDisappear()
    fasterSchedulingPage.getHeadingTextForNewUX().contains(fasterScheduling.headingTextForScheduling)
    fasterSchedulingPage.selectSlotContainerToDrag().then($el => {
      cy.wrap($el).move({
        deltaX: 0,
        deltaY: -200,
        force: true
      })
    })
    fasterSchedulingPage.getConfirmButtonForScheduling().scrollIntoView().should('be.visible').click()
    globalPage.getNotificationTitle().should('be.visible').contains(fasterScheduling.errorMessageForSchedulingBeforeCurrentTime)
  })

  it('Should add availabilities for expert and client', function () {
    fasterSchedulingPage.getSwtichButtonForAvailabilities().should('be.visible').click({ force: true })
    fasterSchedulingPage.getHeadingTextForNewUX().contains(fasterScheduling.headingTextForAvailabilities)
    fasterSchedulingPage.getNextDayButton().should('be.visible').click()
    cy.wrap(slotAvailableData).each(slot => {
      cy.fixture('objects/addAvailableSlotObject').then(
        addAvailableSlotObject => {
          addAvailableSlotObject.availabilities[0].id = slot.uniqueidForClient
          addAvailableSlotObject.availabilities[0].time.start = parseInt(
            slot.startTimeForClient
          )
          addAvailableSlotObject.availabilities[0].time.end = parseInt(
            slot.endTImeForClient
          )
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
            })
          })
        }
      )
    })
    fasterSchedulingPage.getCloseButton().should('be.visible').click()
    expertInvitePage.getEPLStatusDropdown().should('be.visible').contains('Submitted')
  })

  it('Should verify added availability on Schedule Overview', function () {
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
    fasterSchedulingPage
      .getScheduleOverviewTitle()
      .should('be.visible')
      .contains('Schedule Overview')

    fasterSchedulingPage
      .getScheduleOverviewContent()
      .should('be.visible')
      .contains('Suggested Timeslot')

    startTimeReturnedForAvailability = `${generator.returnTimeForAvailableSlot(
      createdAvailableSlots[0].expertAvailabilityToEplsStartTime
    )}`
    endTimeReturnedForAvailability = `${generator.returnTimeForAvailableSlot(
      createdAvailableSlots[0].expertAvailabilityToEplsEndTime
    )}`
    dateReturnedForAvailability = `${generator.returnDateForAvailableSlot(
      createdAvailableSlots[0].expertAvailabilityToEplsStartTime
    )}`
    dateinDDMMYYYYFormat = `${generator.returnDateinDDMMYYYYFormat(
      createdAvailableSlots[0].expertAvailabilityToEplsStartTime
    )}`

    dateInNumber = `${generator.returnDateWithoutMonth(
      createdAvailableSlots[0].expertAvailabilityToEplsStartTime
    )}`

    fasterSchedulingPage
      .getFirstAddedAvailabilityStartTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)

    fasterSchedulingPage
      .getFirstAddedAvailabilityEndTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', endTimeReturnedForAvailability)

    fasterSchedulingPage
      .getgetFirstAddedAvailabilityStartDate()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateInNumber)
  })

  it('Should verify added availability on Scheduling page', function () {
    cy.clickToGoToFirstAvailableSlot(dateInNumber)

    fasterSchedulingPage.getTimeOnDragBar().then($el => {
      timeOnBar = $el.text().trim()
      expect(timeOnBar).to.equal(
        startTimeReturnedForAvailability +
        ' - ' +
        endTimeReturnedForAvailability
      )
    })

    fasterSchedulingPage
      .getDateOnCalender()
      .invoke('val')
      .then(dateOncalender => {
        dateOnCalender = dateOncalender
        expect(dateOnCalender).to.equal(dateinDDMMYYYYFormat)
      })
  })

  it('Should schedule on added availabilities for expert and client', function () {
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('be.visible')
      .click({ force: true })

    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('not.contain', 'Quick')

    fasterSchedulingPage
      .getZoomEditWrapper()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)

    fasterSchedulingPage
      .getZoomEditWrapper()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateReturnedForAvailability)

    cy.wrap(slotScheduleData).each(slot => {
      cy.fixture('objects/addScheduledTimeSlotObject').then(
        addScheduledTimeSlotObject => {
          addScheduledTimeSlotObject.availabilities[0].id =
            slot.uniqueidForClient
          addScheduledTimeSlotObject.availabilities[0].time.start = parseInt(
            slot.startTimeForClient
          )
          addScheduledTimeSlotObject.availabilities[0].time.end = parseInt(
            slot.endTImeForClient
          )
          addScheduledTimeSlotObject.availabilities[1].id =
            slot.uniqueidForExpert
          addScheduledTimeSlotObject.availabilities[1].time.start = parseInt(
            slot.startTimeForExpert
          )
          addScheduledTimeSlotObject.availabilities[1].time.end = parseInt(
            slot.endTimeForExpert
          )
          addScheduledTimeSlotObject.eplId = eplId
          addScheduledTimeSlotObject.timeslots[0].id = slot.uniqueidForSlot
          addScheduledTimeSlotObject.timeslots[0].time.start = parseInt(
            slot.slotScheduleStartTime
          )
          addScheduledTimeSlotObject.timeslots[0].time.end = parseInt(
            slot.slotScheduleEndTime
          )

          cy.requestCreateAvailabilityAndTimeslot(
            authToken,
            addScheduledTimeSlotObject
          ).then(createAvailabilityAndTimeslotResponse => {
            cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
              createdScheduledSlots.push({
                scheduleId:
                  createAvailabilityAndTimeslotResponse.body.schedule.id,
                expertAvailabilityToEplsStartTime:
                  requestGetEPLResponse.body.expertAvailabilityToEpls[0]
                    .schedule.startTime,
                expertAvailabilityToEplsEndTime:
                  requestGetEPLResponse.body.expertAvailabilityToEpls[1]
                    .schedule.endTime
              })
              expect(
                createdScheduledSlots[0].expertAvailabilityToEplsStartTime
              ).to.equal(
                createdAvailableSlots[0].expertAvailabilityToEplsStartTime
              )
              expect(
                createdScheduledSlots[0].expertAvailabilityToEplsEndTime
              ).to.equal(
                createdAvailableSlots[0].expertAvailabilityToEplsEndTime
              )
            })
          })
        }
      )
    })
    fasterSchedulingPage.getConfirmSlotButton().should('be.visible').click()
    cy.wait('@notifyExpert').its('response.statusCode').should('eq', 200)
    cy.wait('@notifyClient').its('response.statusCode').should('eq', 200)
    cy.waitForLoadingDisappear()

    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Scheduled')
  })

  it('Should verify Scheduled slot on EPL', function () {
    cy.reload()
    cy.waitForLoadingDisappear()
    expertInvitePage
      .getDateOnEpl()
      .should('be.visible')
      .contains(dateReturnedForAvailability)

    cy.waitForLoadingDisappear()
    expertInvitePage
      .getTimeOnEpl()
      .should('be.visible')
      .contains(startTimeReturnedForAvailability)

    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Scheduled')
  })

  it('Should verify the scheduled info on Schedule Overview', function () {
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
    fasterSchedulingPage
      .getHeadingForRescheduleOrCancelTimeslot()
      .should('be.visible')
      .contains('Scheduled Timeslot')
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateReturnedForAvailability)
    fasterSchedulingPage
      .getScheduledStartTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)
    fasterSchedulingPage
      .getScheduledEndTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', endTimeReturnedForAvailability)
    fasterSchedulingPage
      .getScheduledStartDate()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateInNumber)
  })

  it('should reschedule a scheduled slot', function () {
    fasterSchedulingPage.getScheduledStartTime().should('be.visible').click()
    fasterSchedulingPage.getNextDayButton().should('be.visible').click()
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('be.visible')
      .click({ force: true })
    fasterSchedulingPage
      .getZoomCreationQuickButton()
      .should('not.contain', 'Quick')
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)
    fasterSchedulingPage
      .getExpertInviteModifyOnOverview()
      .should('be.visible')
      .click({ force: true })
    fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()
    fasterSchedulingPage
      .getClientInviteModifyOnOverview()
      .should('be.visible')
      .click({ force: true })
    fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)
    fasterSchedulingPage.getConfirmSlotButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
  })

  it('Should verify rescheduled slot on EPL', function () {
    cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
      createdAvailableSlots.push({
        addedRescheduledAvailabilityToEplsStartTime:
          requestGetEPLResponse.body.expertAvailabilityToEpls[2].startTime,
        addedRescheduledAvailabilityToEplsEndTime:
          requestGetEPLResponse.body.expertAvailabilityToEpls[3].endTime
      })
      dateofRescheduledSlot = `${generator.returnDateForAvailableSlot(
        createdAvailableSlots[1].addedRescheduledAvailabilityToEplsStartTime
      )}`
      rescheduledateinDDMMYYYYFormat = `${generator.returnDateinDDMMYYYYFormat(
        createdAvailableSlots[1].addedRescheduledAvailabilityToEplsStartTime
      )}`
      dateinFullMonthofRescheduledSlot = `${generator.generateMonthforRescheduleSlot(
        createdAvailableSlots[1].addedRescheduledAvailabilityToEplsStartTime
      )}`
    })

    expertInvitePage
      .getTimeOnEpl()
      .should('be.visible')
      .contains(startTimeReturnedForAvailability)
    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Scheduled')
  })

  it('Should verify rescheduled slot on Schedule Overview', function () {
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
    fasterSchedulingPage
      .getHeadingForRescheduleOrCancelTimeslot()
      .should('be.visible')
      .contains('Scheduled Timeslot')
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)
    fasterSchedulingPage
      .getScheduledStartTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeReturnedForAvailability)
    fasterSchedulingPage
      .getScheduledEndTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', endTimeReturnedForAvailability)
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateofRescheduledSlot)
    fasterSchedulingPage
      .getExpertInviteModifyOnOverview()
      .should('be.visible')
      .click({ force: true })
    fasterSchedulingPage.getDateOnModify().invoke('text').should('contain', dateofRescheduledSlot)
    fasterSchedulingPage.getDateOnSentInvite().invoke('text').should('contain', dateinFullMonthofRescheduledSlot)
    fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()
    fasterSchedulingPage
      .getClientInviteModifyOnOverview()
      .should('be.visible')
      .click({ force: true })
    fasterSchedulingPage.getDateOnModify().invoke('text').should('contain', dateofRescheduledSlot)
    fasterSchedulingPage.sendCalenderInviteButton().should('be.visible').click()
    fasterSchedulingPage
      .getScheduledStartTime()
      .should('be.visible').click({ force: true })
    fasterSchedulingPage
      .getZoomInfoOnScheduledOverview()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateofRescheduledSlot)
    fasterSchedulingPage
      .getDateOnCalender()
      .invoke('val')
      .then(dateOncalender => {
        dateOnCalender = dateOncalender
        expect(dateOnCalender).to.equal(rescheduledateinDDMMYYYYFormat)
      })
    fasterSchedulingPage.getCloseIcon().should('be.visible').click()
    expertInvitePage
      .getDateOnEpl()
      .should('be.visible')
      .contains(dateofRescheduledSlot)
  })

  it('Should cancel the scheduled slot', function () {
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
    cy.intercept('PUT', '/api/expert-project-link/**').as(
      'apiRequestForUpdatingEPL')
    fasterSchedulingPage
      .getCancelIconInScheduleOverview()
      .should('be.visible')
      .click()
    fasterSchedulingPage
      .getCancelOptionsDropdownOnScheduleOverview()
      .should('be.visible')
      .click()
    fasterSchedulingPage
      .getOneCancelOptionOnScheduleOverview()
      .should('be.visible')
      .click()
    fasterSchedulingPage
      .getConfirmationButtonOnScheduleOverview()
      .should('be.visible')
      .click()
    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Not interviewed')
    cy.wait('@apiRequestForUpdatingEPL')
      .its('response.statusCode')
      .should('eq', 200)
  })

  it('Should remove client availabilities which were added for scheduled and rescheduled slot', function () {
    expertInvitePage.getSchedulingToolButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
    fasterSchedulingPage
      .getScheduleOverviewTitle()
      .should('be.visible')
      .contains('Schedule Overview')
    fasterSchedulingPage
      .getScheduleOverviewContent()
      .should('be.visible')
      .contains('Suggested Timeslot')
    cy.clickToGoToFirstAvailableSlot(dateInNumber)
    fasterSchedulingPage
      .getSwtichButtonForAvailabilities()
      .should('be.visible')
      .scrollIntoView()
      .click()
    fasterSchedulingPage
      .getAlreadyAddedClientAvailabiltiy()
      .should('exist')
      .click({ force: true })
    cy.intercept('POST', '/api/expert-project-link/**/schedule').as(
      'apiRequestForRemovingClientAvailability'
    )

    fasterSchedulingPage
      .getDeleteIconForAvailability()
      .should('exist')
      .click({ force: true })
    cy.wait('@apiRequestForRemovingClientAvailability')
      .its('response.statusCode')
      .should('eq', 200)
    fasterSchedulingPage.getNextDayButton().should('be.visible').click()
    fasterSchedulingPage
      .getAlreadyAddedClientAvailabiltiy()
      .should('exist')
      .click({ force: true })
    fasterSchedulingPage
      .getDeleteIconForAvailability()
      .should('exist')
      .click({ force: true })
    cy.wait('@apiRequestForRemovingClientAvailability')
      .its('response.statusCode')
      .should('eq', 200)
    fasterSchedulingPage.getConfirmSlotButton().should('be.visible').click()
    cy.waitForLoadingDisappear()
    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Not interviewed')
  })
})

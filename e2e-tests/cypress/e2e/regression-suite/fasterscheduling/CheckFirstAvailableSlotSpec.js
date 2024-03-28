/// <reference types="Cypress" />
import generator from '../../../support/generator'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import FasterSchedulingPage from '../../../pageObjects/FasterSchedulingPage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'

describe('Check first available slot', { tags: "regression" }, function () {
  let testUsers,
    projectId,
    eplId,
    projectDetails,
    fasterScheduling,
    authToken,
    localStorage,
    startTimeOnOverview,
    endTimeOnOverview,
    dateOnOverview,
    segmentId

  let expertData = generator.generateExpertNames(1)[0]

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const startTimeForHalfhourSlot = `${generator.startTimeForTomorrowSlotAvailability()}`
  const endTimeForHalfhourSlot = `${generator.endTimeForTomorrowSlotAvailability()}`
  const uniqueidForHalfhourClientSlot = `${generator.generateUniqueIDForClient()}`
  const uniqueidForHalfhourExpertSlot = `${generator.generateUniqueIDForExpert()}`

  const startTimeForOnehourSlot = `${generator.startTimeForRescheduleSlot()}`
  const endTimeForOnehourSlot = `${generator.endTimeForRescheduleSlotOfOneHour()}`
  const uniqueidForSecondHalfhourClientSlot = `${generator.generateUniqueIDForClient()}`
  const uniqueidForSecondHalfhourExpertSlot = `${generator.generateUniqueIDForExpert()}`
  const uniqueidForOnehourClientSlot = `${generator.generateUniqueIDForClient()}`
  const uniqueidForOnehourExpertSlot = `${generator.generateUniqueIDForExpert()}`

  const expertInvitePage = new ExpertInvitePage()
  const fasterSchedulingPage = new FasterSchedulingPage()
  const expertPipelinePage = new ExpertPipelinePage()
  let slotAvailableDataForHalfHour = []
  let createdAvailableHalfhourSlots = []

  let slotAvailableDataForOneHour = []
  let createdAvailableOnehourSlots = []

  slotAvailableDataForHalfHour.push({
    startTimeForExpert: startTimeForHalfhourSlot,
    endTimeForExpert: endTimeForHalfhourSlot,
    startTimeForClient: startTimeForHalfhourSlot,
    endTImeForClient: endTimeForHalfhourSlot,
    uniqueidForClient: uniqueidForHalfhourClientSlot,
    uniqueidForExpert: uniqueidForHalfhourExpertSlot
  })

  slotAvailableDataForOneHour.push({
    startHalfHourTimeForExpert: startTimeForHalfhourSlot,
    endHalfHourTimeForExpert: endTimeForHalfhourSlot,
    startHalfHourTimeForClient: startTimeForHalfhourSlot,
    endHalfHourTImeForClient: endTimeForHalfhourSlot,
    uniqueidForHalfHourClient: uniqueidForSecondHalfhourClientSlot,
    uniqueidForHalfHourExpert: uniqueidForSecondHalfhourExpertSlot,
    startTimeForExpert: startTimeForOnehourSlot,
    endTimeForExpert: endTimeForOnehourSlot,
    startTimeForClient: startTimeForOnehourSlot,
    endTImeForClient: endTimeForOnehourSlot,
    uniqueidForClient: uniqueidForOnehourClientSlot,
    uniqueidForExpert: uniqueidForOnehourExpertSlot
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
        segmentId = projectCreateResponse.body.segmentId

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
              cy.requestCreateExpert(authToken, expertCreateObject).then(
                expertCreateResponse => {
                  cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id).then(
                    addAndInviteExpertToProjectFromAPIResponse => {
                      eplId =
                        addAndInviteExpertToProjectFromAPIResponse.body.id

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


                          localStorage = quickLoginResponse.body
                          cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

                        })
                      })
                      cy.fixture('fasterScheduling').then(fasterSchedulingFixture => {
                        fasterScheduling = fasterSchedulingFixture
                      })
                    }
                  )
                })
            })
          })
        })
      })
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.intercept('GET', '**/api/team/active').as(
      'waitForActiveTeam')

    cy.intercept('GET', '**/api/parent-account/**/clients').as(
      'waitForParentAccount')

    cy.intercept('GET', '**/api/email-template/group/**').as(
      'waitForEmailTemplate')
  })

  it('Should show 30 mins slot as first available slot when only 30 mins slot is there', function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}`)
    expertInvitePage.getExpertsPipelineButton().click()
    cy.waitForLoadingDisappear()

    cy.wrap(slotAvailableDataForHalfHour).each(slot => {
      cy.fixture('objects/addAvailabilityAsPerDurationObject').then(
        addAvailabilityAsPerDurationObject => {
          addAvailabilityAsPerDurationObject.availabilities[0].id =
            slot.uniqueidForClient
          addAvailabilityAsPerDurationObject.availabilities[0].time.start = parseInt(
            slot.startTimeForClient
          )
          addAvailabilityAsPerDurationObject.availabilities[0].time.end = parseInt(
            slot.endTImeForClient
          )
          addAvailabilityAsPerDurationObject.availabilities[1].id =
            slot.uniqueidForExpert
          addAvailabilityAsPerDurationObject.availabilities[1].time.start = parseInt(
            slot.startTimeForExpert
          )
          addAvailabilityAsPerDurationObject.availabilities[1].time.end = parseInt(
            slot.endTimeForExpert
          )
          addAvailabilityAsPerDurationObject.eplId = eplId

          cy.requestCreateAvailabilityAndTimeslot(
            authToken,
            addAvailabilityAsPerDurationObject
          )
        }
      )
    })
    cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
      createdAvailableHalfhourSlots.push({
        startTime:
          requestGetEPLResponse.body.expertAvailabilityToEpls[0].startTime,
        endTime: requestGetEPLResponse.body.expertAvailabilityToEpls[1].endTime
      })
      expertInvitePage
        .getSchedulingToolButton()
        .should('be.visible')
        .click()

      cy.wait('@waitForActiveTeam')
        .its('response.statusCode').should('eq', 200)

      cy.wait('@waitForParentAccount')
        .its('response.statusCode').should('eq', 200)

      cy.wait('@waitForEmailTemplate')
        .its('response.statusCode').should('eq', 200)

      fasterSchedulingPage
        .getScheduleOverviewTitle()
        .should('be.visible')
        .contains('Schedule Overview')

      fasterSchedulingPage
        .getScheduleOverviewContent()
        .should('be.visible')
        .contains('Suggested Timeslot')

      startTimeOnOverview = `${generator.returnTimeForAvailableSlot(
        createdAvailableHalfhourSlots[0].startTime
      )}`
      endTimeOnOverview = `${generator.returnTimeForAvailableSlot(
        createdAvailableHalfhourSlots[0].endTime
      )}`
      dateOnOverview = `${generator.returnDateWithoutMonth(
        createdAvailableHalfhourSlots[0].startTime
      )}`
      fasterSchedulingPage
        .getFirstAddedAvailabilityStartTime()
        .should('be.visible')
        .invoke('text')
        .should('contain', startTimeOnOverview)

      fasterSchedulingPage
        .getFirstAddedAvailabilityEndTime()
        .should('be.visible')
        .invoke('text')
        .should('contain', endTimeOnOverview)

      fasterSchedulingPage
        .getgetFirstAddedAvailabilityStartDate()
        .should('be.visible')
        .invoke('text')
        .should('contain', dateOnOverview)
    })

    fasterSchedulingPage
      .getCloseButton()
      .should('be.visible')
      .click()

    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Submitted')
  })

  it('Should show 60 mins slot as first available slot when 30 mins and 60 mins both slots are there', function () {
    cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
      cy.requestGetClientToProjectAvailability(authToken, projectId).then(
        requestGetClientToProjectAvailabilityResponse => {
          cy.wrap(slotAvailableDataForOneHour).each(slot => {
            cy.fixture(
              'objects/addAvailabilityOnAlreadyAddedAvailabilityObject'
            ).then(addAvailabilityOnAlreadyAddedAvailabilityObject => {
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[0].id =
                slot.uniqueidForHalfHourClient
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[0].time.start = parseInt(
                slot.startHalfHourTimeForClient
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[0].time.end = parseInt(
                slot.endHalfHourTImeForClient
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[0].raw.group[0] =
                requestGetClientToProjectAvailabilityResponse.body[0].id

              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[0].raw.group[1] =
                requestGetClientToProjectAvailabilityResponse.body[1].id

              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[1].id =
                slot.uniqueidForHalfHourExpert
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[1].time.start = parseInt(
                slot.startHalfHourTimeForExpert
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[1].time.end = parseInt(
                slot.endHalfHourTimeForExpert
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[1].raw.group[0] =
                requestGetEPLResponse.body.expertAvailabilityToEpls[0].id

              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[1].raw.group[1] =
                requestGetEPLResponse.body.expertAvailabilityToEpls[1].id

              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[2].id =
                slot.uniqueidForClient
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[2].time.start = parseInt(
                slot.startTimeForClient
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[2].time.end = parseInt(
                slot.endTImeForClient
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[3].id =
                slot.uniqueidForExpert
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[3].time.start = parseInt(
                slot.startTimeForExpert
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.availabilities[3].time.end = parseInt(
                slot.endTimeForExpert
              )
              addAvailabilityOnAlreadyAddedAvailabilityObject.eplId = eplId
              cy.requestCreateAvailabilityAndTimeslot(
                authToken,
                addAvailabilityOnAlreadyAddedAvailabilityObject
              )
            })
          })
        }
      )
    })
    cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
      createdAvailableOnehourSlots.push({
        startTime:
          requestGetEPLResponse.body.expertAvailabilityToEpls[2].startTime,
        endTime: requestGetEPLResponse.body.expertAvailabilityToEpls[5].endTime
      })
      expertInvitePage
        .getSchedulingToolButton()
        .should('be.visible')
        .click()

      cy.wait('@waitForActiveTeam')
        .its('response.statusCode').should('eq', 200)

      cy.wait('@waitForParentAccount')
        .its('response.statusCode').should('eq', 200)

      cy.wait('@waitForEmailTemplate')
        .its('response.statusCode').should('eq', 200)

      fasterSchedulingPage
        .getScheduleOverviewTitle()
        .should('be.visible')
        .contains('Schedule Overview')

      fasterSchedulingPage
        .getScheduleOverviewContent()
        .should('be.visible')
        .contains('Suggested Timeslot')

      startTimeOnOverview = `${generator.returnTimeForAvailableSlot(
        createdAvailableOnehourSlots[0].startTime
      )}`
      endTimeOnOverview = `${generator.returnTimeForAvailableSlot(
        createdAvailableOnehourSlots[0].endTime
      )}`
      dateOnOverview = `${generator.returnDateWithoutMonth(
        createdAvailableOnehourSlots[0].startTime
      )}`
      fasterSchedulingPage
        .getFirstAddedAvailabilityStartTime()
        .should('be.visible')
        .invoke('text')
        .should('contain', startTimeOnOverview)

      fasterSchedulingPage
        .getFirstAddedAvailabilityEndTime()
        .should('be.visible')
        .invoke('text')
        .should('contain', endTimeOnOverview)

      fasterSchedulingPage
        .getgetFirstAddedAvailabilityStartDate()
        .should('be.visible')
        .invoke('text')
        .should('contain', dateOnOverview)
    })

    fasterSchedulingPage
      .getCloseButton()
      .should('be.visible')
      .click()

    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Submitted')
  })

  it('Should show 60 mins slot as first available slot if only 60 mins slot is there', function () {
    cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
      cy.fixture('objects/removeExpertAvailabilitiesObject').then(
        removeExpertAvailabilitiesObject => {
          removeExpertAvailabilitiesObject.expertAvailabilitiesToRemove[0] =
            requestGetEPLResponse.body.expertAvailabilityToEpls[0].id
          removeExpertAvailabilitiesObject.expertAvailabilitiesToRemove[1] =
            requestGetEPLResponse.body.expertAvailabilityToEpls[1].id
          cy.requestRemoveAvailabilities(
            authToken,
            eplId,
            removeExpertAvailabilitiesObject
          )
        }
      )
    })

    cy.requestGetClientToProjectAvailability(authToken, projectId).then(
      requestGetClientToProjectAvailabilityResponse => {
        cy.fixture('objects/removeClientAvailabilitiesObject').then(
          removeClientAvailabilitiesObject => {
            removeClientAvailabilitiesObject.clientAvailabilitiesToRemove[0] =
              requestGetClientToProjectAvailabilityResponse.body[0].id
            removeClientAvailabilitiesObject.clientAvailabilitiesToRemove[1] =
              requestGetClientToProjectAvailabilityResponse.body[1].id
            cy.requestRemoveAvailabilities(
              authToken,
              eplId,
              removeClientAvailabilitiesObject
            )
          }
        )
      }
    )
    expertInvitePage
      .getSchedulingToolButton()
      .should('be.visible')
      .click()

    cy.wait('@waitForActiveTeam')
      .its('response.statusCode').should('eq', 200)

    cy.wait('@waitForParentAccount')
      .its('response.statusCode').should('eq', 200)

    cy.wait('@waitForEmailTemplate')
      .its('response.statusCode').should('eq', 200)

    fasterSchedulingPage
      .getScheduleOverviewTitle()
      .should('be.visible')
      .contains('Schedule Overview')

    fasterSchedulingPage
      .getScheduleOverviewContent()
      .should('be.visible')
      .contains('Suggested Timeslot')

    fasterSchedulingPage
      .getFirstAddedAvailabilityStartTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', startTimeOnOverview)

    fasterSchedulingPage
      .getFirstAddedAvailabilityEndTime()
      .should('be.visible')
      .invoke('text')
      .should('contain', endTimeOnOverview)

    fasterSchedulingPage
      .getgetFirstAddedAvailabilityStartDate()
      .should('be.visible')
      .invoke('text')
      .should('contain', dateOnOverview)

    fasterSchedulingPage
      .getCloseButton()
      .should('be.visible')
      .click()

    expertInvitePage
      .getEPLStatusDropdown()
      .should('be.visible')
      .contains('Submitted')
  })

  it('Should go to Scheduling, if there is no match for expert and client', function () {
    cy.requestGetEPL(authToken, eplId).then(requestGetEPLResponse => {
      cy.fixture('objects/removeExpertAvailabilitiesOfOneHourObject').then(
        removeExpertAvailabilitiesOfOneHourObject => {
          removeExpertAvailabilitiesOfOneHourObject.expertAvailabilitiesToRemove[0] =
            requestGetEPLResponse.body.expertAvailabilityToEpls[0].id
          removeExpertAvailabilitiesOfOneHourObject.expertAvailabilitiesToRemove[1] =
            requestGetEPLResponse.body.expertAvailabilityToEpls[1].id
          removeExpertAvailabilitiesOfOneHourObject.expertAvailabilitiesToRemove[2] =
            requestGetEPLResponse.body.expertAvailabilityToEpls[2].id
          removeExpertAvailabilitiesOfOneHourObject.expertAvailabilitiesToRemove[3] =
            requestGetEPLResponse.body.expertAvailabilityToEpls[3].id

          cy.requestRemoveAvailabilities(
            authToken,
            eplId,
            removeExpertAvailabilitiesOfOneHourObject
          )
        }
      )
    })

    cy.requestGetClientToProjectAvailability(authToken, projectId).then(
      requestGetClientToProjectAvailabilityResponse => {
        cy.fixture('objects/removeClientAvailabilitiesOfOneHourObject').then(
          removeClientAvailabilitiesOfOneHourObject => {
            removeClientAvailabilitiesOfOneHourObject.clientAvailabilitiesToRemove[0] =
              requestGetClientToProjectAvailabilityResponse.body[0].id
            removeClientAvailabilitiesOfOneHourObject.clientAvailabilitiesToRemove[1] =
              requestGetClientToProjectAvailabilityResponse.body[1].id
            removeClientAvailabilitiesOfOneHourObject.clientAvailabilitiesToRemove[2] =
              requestGetClientToProjectAvailabilityResponse.body[2].id
            removeClientAvailabilitiesOfOneHourObject.clientAvailabilitiesToRemove[3] =
              requestGetClientToProjectAvailabilityResponse.body[3].id

            cy.requestRemoveAvailabilities(
              authToken,
              eplId,
              removeClientAvailabilitiesOfOneHourObject
            )
          }
        )
      }
    )
    expertInvitePage
      .getSchedulingToolButton()
      .should('be.visible')
      .click()

    cy.wait('@waitForActiveTeam')
      .its('response.statusCode').should('eq', 200)

    cy.wait('@waitForParentAccount')
      .its('response.statusCode').should('eq', 200)

    cy.wait('@waitForEmailTemplate')
      .its('response.statusCode').should('eq', 200)

    fasterSchedulingPage
      .getHeadingTextForNewUX()
      .contains(fasterScheduling.headingTextForScheduling)
  })
})

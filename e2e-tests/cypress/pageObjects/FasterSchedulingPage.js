class FasterSchedulingPage {
  getSwitchButtonForNewUX () {
    return cy.get('.slider')
  }

  selectMeetingType(meetingType){
  return cy.get('select#handleMeetingType').select(meetingType)
  }

  getHeadingTextForNewUX () {
    return cy
      .get('.overview-title .overview-title-description')
      .should('be.visible')
  }
  getSwtichButtonForAvailabilities () {
    return cy.get('#calendarContainer span.slider.round').scrollIntoView()
  }

  getNextDayButton () {
    return cy.get('#next').should('be.visible')
  }

  // all 24 slots
  selectExpertAvailability () {
    return cy.get(
      '.calendarContainer .calendarExpert .tui-full-calendar-timegrid-right .tui-full-calendar-timegrid-h-grid  .tui-full-calendar-timegrid-gridline'
    )
  }

  // as per nth child
  selectASlotForExpert () {
    return cy.get(
      '.calendarContainer .calendarExpert .tui-full-calendar-timegrid-right .tui-full-calendar-timegrid-h-grid :nth-child(10)'
    )
  }

  selectSlotContainerToDrag () {
    return cy.get('.calendarContainer .slotContainer > #timeslot')
  }

  getTimeOnDragBar () {
    return cy.get('#opsTime')
  }

  getDateOnCalender () {
    return cy.get('#pickDay')
  }

  getSelectDuration () {
    return cy.get('.selectDuration')
  }
  getTimeFromSlotContainerToDrag () {
    return cy.get('.calendarContainer .slotContainer > #timeslot #timeTarget')
  }

  selectSlotContainer () {
    return cy.get('.slotContainer')
  }

  selectSideScrollOfScreen () {
    return cy.get(
      'body.ReactModal__Body--open:nth-child(2) div.ReactModalPortal:nth-child(7) > div.modal__overlay.modal__overlay--after-open'
    )
  }

  getCurrentTimeBar () {
    return cy.get(
      '.calendarContainer .calendarClient .tui-full-calendar-timegrid-hourmarker .tui-full-calendar-timegrid-hourmarker-line-today'
    )
  }

  getCloseButton () {
    return cy.get('.button--secondary').contains('Close').scrollIntoView()
  }

  getCurrentTimeHighlightedOnCurrentTimeBar () {
    return cy.get('[xpath="1"] > :nth-child(1)')
  }

  getZoomCreationQuickButton () {
    return cy.get('.request-schedule__invite-action_NEW.mw0:nth-child(1)').scrollIntoView()
  }

  getConfirmButtonForScheduling () {
    return cy.get(
      '.request-schedule__controls--left > button.button.button--primary:nth-child(1)'
    )
  }
  getConfirmButtonForAvailability () {
    return cy.get('.expert-profile .button.button.button--primary')
  }

  getHeadingForRescheduleOrCancelTimeslot () {
    return cy.get('.overview-content-timeslot-wrapper h5')
  }

  getCancelIconInScheduleOverview () {
    return cy.get('.schedule .close-wrapper svg')
  }

  getCancelOptionsDropdownOnScheduleOverview () {
    return cy.get(
      '.EPLStatusModal__dropdown [data-cy="status-comment-dropdown"]'
    )
  }

  getOneCancelOptionOnScheduleOverview () {
    return cy.get('.autocomplete__results-container  > :nth-child(2)')
  }

  getConfirmationButtonOnScheduleOverview () {
    return cy.get('.EPLStatusModal .button--primary')
  }

  getZoomInfoOnScheduledOverview () {
    return cy.get('.request-schedule__invite-info_FS > :nth-child(2) > :nth-child(1)').scrollIntoView()
  }

  getScheduleOverviewTitle () {
    return cy.get('.overview-title h4')
  }

  getScheduleOverviewContent () {
    return cy.get('.overview-content h5')
  }

  getZoomEditWrapper () {
    return cy.get('.editZoomInfo_wrapper')
  }

  getConfirmSlotButton () {
    return cy.get('.schedule-calendar-modal  .button--primary').scrollIntoView()
  }

  getDeleteIconForAvailability () {
    return cy.get('.tui-full-calendar-popup-delete > .tui-full-calendar-icon')
  }

  getAlreadyAddedClientAvailabiltiy () {
    return cy.get(
      'div.calendarClient div.tui-full-calendar-time-schedule > div.tui-full-calendar-time-schedule-content.tui-full-calendar-time-schedule-content-time > span')
  }

  getFirstAddedAvailabilityStartTime () {
    return cy.get('.slice-wrapper.first_match > :nth-child(3) >  :nth-child(1)')
  }

  getFirstAddedAvailabilityEndTime () {
    return cy.get('.slice-wrapper.first_match > :nth-child(3) >  :nth-child(2)')
  }

  getgetFirstAddedAvailabilityStartDate () {
    return cy.get('.slice-wrapper.first_match > :nth-child(2) > :nth-child(2)')
  }

  getScheduledStartTime () {
    return cy.get('.slice-wrapper > :nth-child(3) >  :nth-child(1)').scrollIntoView()
  }

  getScheduledEndTime () {
    return cy.get('.slice-wrapper > :nth-child(3) >  :nth-child(2)')
  }

  getScheduledStartDate () {
    return cy.get('.slice-wrapper > :nth-child(2) > :nth-child(2)')
  }

  getMessageContentOnClientInvite () {
    return cy.get('.fr-wrapper .fr-element p:nth-child(2)')
  }

  getZoomCreationCustomButton () {
    return cy.get('div.request-schedule__invite-action_NEW.mw0:nth-child(3)').scrollIntoView()
  }

  getZoomTopicField () {
    return cy.get('input[name="topic"]')
  }

  getConfirmButtonForZoomMeeting () {
    return cy.get('.overview .button--primary')
  }

  getQuickInviteModifyButton () {
    return cy.get('.request-schedule__invite-item_NEW:nth-child(2) div:nth-child(2)  div:nth-child(1)').scrollIntoView()
  }

  getExpertInviteModifyButton () {
    return cy.get('.request-schedule__invite-item_NEW:nth-child(3) div:nth-child(2)  div:nth-child(3)').scrollIntoView()
  }

  getClientInviteModifyButton () {
    return cy.get('.request-schedule__invite-item_NEW:nth-child(4) div:nth-child(2)  div:nth-child(3)').scrollIntoView()
  }

  getReschuleClientInviteModifyButton () {
    return cy.get('.request-schedule__invite-item_NEW:nth-child(4) div:nth-child(3)').scrollIntoView()
  }

  getExpertInviteModifyOnOverview () {
    return cy.get('.request-schedule__invite-item_NEW:nth-child(3) div:nth-child(3)').scrollIntoView()
  }

  getClientInviteModifyOnOverview () {
    return cy.get('.request-schedule__invite-item_NEW:nth-child(4) div:nth-child(3)').scrollIntoView()
  }

  getSubjectOfInvite () {
    return cy.get(':nth-child(7) > .expert-form__input-wrapper > .expert-form__input')
   }

  sendCalenderInviteButton () {
    return cy.get('.request-schedule__controls__inner button:nth-child(1)').scrollIntoView()
  }

  getCalendarIconByEpl (epl) {
    return cy.get(`.icons [data-cy-epl="${epl}"]`)
 }

 getAddAnotherExpertButton () {
   return  cy.get('.toggleCalendarButton:nth-child(1) svg')
 }

 selectAddAnotherExpert () {
   return  cy.get('.expertToAddEPLContainer input[type="checkbox"]')
 }

 getMultiExpertMeetingHeadnig () {
   return cy.get('.multiExpertContainer h3')
 }

 getTypeOptions () {
  return cy.get('.expert-profile #handleMeetingType')
}

selectTypeNoneForScheduling () {
  return cy.get('#handleMeetingType').select('None')
}

getExpertInviteForNone () {
  return cy.get(':nth-child(2) > .request-schedule__invite-action_NEW > span').scrollIntoView()
}

getTimeInExpertInvite() {
  return cy.get('.overview .unEditbaleInvite')
}

getConfirmButtonForNone () {
  return cy.get('.expert-profile .button--primary').scrollIntoView()
}

getExpertTimeForSchedule () {
  return cy.get('.expert-profile .resultx')
}

getScheduleTimeForOpsTimeZone () {
  return cy.get('.expert-profile .opsTime')
}

getCloseIcon () {
  return cy.get('.close-icon > svg').scrollIntoView()
}

getDateOnModify () {
  return cy.get('.overview .expert-form__input-group:nth-child(9) .expert-form__input-wrapper').should('be.visible')
}

getDateOnSentInvite () {
  return cy.get('.overview .fr-wrapper p:nth-child(2)').should('be.visible')
}

getClinetSubject (text) {
  return cy.get('.expert-form__label').contains(text).parent().find('.expert-form__input-wrapper').find('.expert-form__input')
}

getAnonymizeExpert () {
  return cy.get('[id="anonymizeExpert"]').scrollIntoView()
}

getAnonymizeClient () {
  return cy.get('[id="anonymizeClients"]').scrollIntoView()
}

getConfirmButton () {
  return cy.get('.button--primary').contains('Confirm')
}
getSendCalendarInvitation () {
  return cy.get('[type="submit"]').contains('Send calendar invitation')
}
getSendCalendarInvitBtn () {
  return cy.get('.request-schedule__controls__inner > .button').scrollIntoView()
}

}
export default FasterSchedulingPage

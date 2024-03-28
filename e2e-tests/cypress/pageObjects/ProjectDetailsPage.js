class ProjectDetailsPage {
  getProjectSegments() {
    return cy.get('.Segment > :nth-child(3)')
  }

  getProjectPipeline() {
    return cy.get('a[href*="/experts-pipeline"]').should('be.visible')
  }

  getShareEPLDisabledButton() {
    return cy.get('div[class="action action--disabled"]').contains('Share EPL')
  }

  getExportAllExpertsRadio() {
    return cy.get('.radio-button-input').contains('Export all experts')
  }

  selectExportFileFormat(fileFormat) {
    cy.get('.modal__overlay button.autocomplete__input').should('be.visible').click()
    cy.get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible').each($el => {
        if ($el.text() === fileFormat) {
          cy.wrap($el).click()
        }
      })
  }

  getEPLCheckbox(index = 2) {
    cy.get('.ep-wrapper__table').should('exist')
    return cy.get(`.ep-wrapper__table div :nth-child(${index}) input[type=checkbox]`).should('be.visible')
  }

  getSelectAllEPLsCheckbox() {
    return cy.get('.group-label > .checkbox__wrapper > .checkbox')
  }

  checkEPLScheduledTime(expertName, time) {
    cy.get('.single__content__thumb').each(($el, index, $list) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        return cy.get('.single__content__thumb')
          .find('span.schedule-wrapper__time')
          .eq(index)
          .should('have.text', time)
      }
    })
  }

  getEPLExpertName() {
    return cy.get('.single__content__thumb strong')
  }

  getEPLStatus() {
    return cy.get('[data-cy="reply-status-dropdown"]').should('be.visible')
  }

  getVerifyEPLStatus() {
    return cy.get('.autocomplete__input--blue')
  }

  getAccepttMouseOver() {
    return cy.get('.acceptance-wrapper')
  }

  getRejectMouseOver() {
    return cy.get('.rejection-wrapper')
  }


  getToolTipText() {
    return cy.get('.rc-tooltip-inner')
  }

  getProjectCorrespondance() {
    return cy.get('[href*="/correspondence"] li')
  }

  getProjectRequiredInterviews() {
    return cy.get(':nth-child(1) > .actions > strong')
  }

  getProjectTarget() {
    return cy.get('strong > .pull-right')
  }

  getProjectName() {
    return cy.get('.name-status-wrapper > h1').should('be.visible')
  }

  getClientContact() {
    return cy.get('.contacts-label__list > span').should('be.visible')
  }

  getAtheneumContact() {
    return cy.get('span.team-label:contains(Atheneum contacts:) .team-label__list').should('be.visible')
  }
  getProjectManager() {
    return cy.get('span.team-label:contains(Project manager:) .team-label__list').scrollIntoView().should('be.visible')
  }

  getMckinseyLabelMessage() {
    return cy.get('.name-status-wrapper div[style*=margin]').should('be.visible')
  }

  getProjectStatus() {
    return cy.get('.option-group__option--selected').should('be.visible')
  }

  getProjectBackground() {
    return cy.get(':nth-child(1) > .text > div').should('be.visible')
  }

  getProjectMckinseyBackground() {
    return cy.get('.text > :nth-child(2)').should('be.visible')
  }

  getProjectDetailsValueByRowName(rowName) {
    return cy.get('.row__name').contains(rowName).parent().find('.row__value')
  }

  getProjectMckinseyCustomer() {
    return cy.get('.text > :nth-child(3)').should('be.visible')
  }

  getProjectMckinseyGeographies() {
    return cy.get('.text > :nth-child(4)').should('be.visible')
  }

  getProjectMckinseySeniority() {
    return cy.get('.text > :nth-child(5)').should('be.visible')
  }

  getProjectMckinseyJobs() {
    return cy.get('.text > :nth-child(6)').should('be.visible')
  }

  getProjectMckinseyTarget() {
    return cy.get('.text > :nth-child(7)').should('be.visible')
  }

  getProjectCorrespondanceMobileTitle() {
    return cy.get('div.MuiAccordion-root div[class*="MessageHeader"]').should('be.visible')
  }

  getProjectCorrespondanceMobileMessage() {
    return cy.get('div#capi div[class*="MessageContent"]').should('be.visible')
  }

  clickProjectCorrespondanceMobileFilters(filterName) {
    return cy.get('div#capi div[class*="Filter-"]').contains(filterName).click()
  }

  getProjectCorrespondanceContactFrom() {
    return cy.get('div.correspondence-content div.contact').first()
  }

  getProjectCorrespondanceContactTo() {
    return cy.get('div.correspondence-content div.contact').last()
  }

  getProjectCorrespondanceAttachments() {
    return cy.get('div.correspondence-content div.attachment-wrapper a')
  }

  getProjectCorrespondanceSubject(itemIndex) {
    return cy.get(`div.correspondence-list li:nth-child(${itemIndex}) div.subject`)
  }

  clickProjectCorrespondanceBySubject(subject) {
    cy.get('div.correspondence-list div.subject').contains(subject)
    cy.get('div.correspondence-list div.subject').each((correspondanceElement, index) => {
      if (correspondanceElement.text() === subject) {
        cy.get('div.correspondence-list div.subject')
          .eq(index)
          .click()
        return false
      }
    })
  }

  getProjectCorrespondanceContact(itemIndex) {
    return cy.get(`div.correspondence-list li:nth-child(${itemIndex}) div.contact b`)
  }

  getProjectCorrespondanceBody() {
    return cy.get('.body-frame').should('be.visible').its('0.contentDocument.body').should('not.be.empty')
      .then(cy.wrap).find('div[style*=font]')
  }

  getProjectCorrespondanceBodyChat() {
    return cy.get('.body-frame').should('be.visible').its('0.contentDocument.body').should('not.be.empty')
  }

  getProjectCorrespondanceReplyButton() {
    return cy.get('.reply-button')
  }

  getProjectCorrespondanceBodyTextarea() {
    return cy.get('.reply-wrapper .fr-element').should('exist')
  }

  getBlacklistedCompanies() {
    return cy.get(':nth-child(2) > .text > div').should('be.visible')
  }

  getInvoicingInstructions() {
    return cy.get(':nth-child(3) > .text > div').should('be.visible')
  }

  getClientAvailabilities() {
    return cy.get('.info-box-wrapper__rows > :nth-child(1) > p')
  }

  getClientPrefferedLanguages() {
    return cy.get('.info-box-wrapper__rows > :nth-child(2) > p')
  }

  getProjectDetailsRowValueByName(rowName) {
    return cy.get('div.row > span.row__name').contains(rowName).parent().find('span.row__value')
  }

  getEditSegmentButton() {
    return cy.get('.Segment #edit.icon__fill')
  }

  getScreeningQuestionsAddButton() {
    return cy.get('.expert-form__repeatable-action--add')
  }

  getScreeningTextAreaList() {
    return cy.get('.expert-form .fr-box .fr-element')
  }

  getEditSegmentFormSaveButton() {
    return cy.get('.button--primary')
  }

  getEditSegmentFormCancelButton() {
    return cy.get('.expert-form__section > .button--secondary')
  }

  getProjectStoryDetailsList() {
    return cy.get('.story p.rich-text--light')
  }

  getAtheneumContactsLabel() {
    return cy.get('span.team-label')
  }

  getComplianceStatus() {
    return cy.get(':nth-child(1) > :nth-child(9) > .row__value')
  }

  getComplianceAuditFilter() {
    return cy.get(' div.filters-wrapper__group:nth-child(1) div.filters-wrapper__group__checkbox > label.filters-wrapper__group__checkbox-label')
  }

  selectPendingStatus() {
    return cy.get('.option-group__option:nth-child(2)')
  }

  selectClosedStatus() {
    return cy.get('.option-group__option:nth-child(3)')
  }

  inputClosingProjectComment() {
    return cy.get('textarea.expert-form__input')
  }

  submitButton() {
    return cy.get('button[type="submit"]')
  }

  getEditProjectBtn() {
    return cy.get('[data-cy="edit-project-btn"] span').should('be.visible')
  }

  getProjectTypeEBR() {
    return cy.get('.radio-group__item:nth-child(2) > div.radio-input').scrollIntoView()
  }
  getProjectTypeEP() {
    return cy.get('.radio-group__item:nth-child(3) > div.radio-input').scrollIntoView()
  }
  getProjectTypeESR() {
    return cy.get('.radio-group__item:nth-child(4) > div.radio-input').scrollIntoView()
  }

  getExternalComplianceCheckbox() {
    return cy.get('input[name="complianceRequired"]').should('be.visible')
  }

  getAssignToStatusBatchActionDisableBtn() {
    return cy.get('.batch-actions__action-wrapper:nth-child(1) .autocomplete__input--disabled')
  }

  getAssignToSegmentBatchActionDisableBtn() {
    return cy.get('.batch-actions__action-wrapper:nth-child(2) .autocomplete__input--disabled')
  }

  getBatchActionMessage() {
    return cy.get('#swal2-content').should('be.visible')
  }

  getOkbtnOnErrorMessagePopUp() {
    return cy.get('button[type="button"]').contains('Ok').should('be.visible')
  }

  getAssignToSegmentRadioBtn() {
    return cy.get('.batch-actions__action-wrapper:nth-child(2) .radio-input').should('be.visible')
  }

  getAssignToStatusRadioBtn() {
    return cy.get('.batch-actions__action-wrapper:nth-child(1) .radio-input').should('be.visible')
  }

  getStatusDropdown() {
    return cy.get('.batch-actions__action-wrapper:nth-child(1) .autocomplete__container').should('be.visible')
  }

  getAutocompleteItems() {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('be.visible')
  }

  selectStatus(status) {
    this.getStatusDropdown().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(status)) {
        cy.wrap($el).click()
      }
    })
    this.getStatusDropdown().contains(status)
  }

  getStatusSegment() {
    return cy.get('.batch-actions__action-wrapper:nth-child(2) .autocomplete__container').should('be.visible')
  }

  getWorkStreamName() {
    return cy.get('span.segment--name').should('exist')
  }

  selectSegment(segment) {
    this.getStatusSegment().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(segment)) {
        cy.wrap($el).click()
      }
    })
    this.getStatusSegment().contains(segment)
  }

  getYesOnPopUp() {
    return cy.get('button[type="button"]').contains('Yes').should('be.visible')
  }

  getAddSegmentBtn() {
    return cy.get('.Segment .segment-edit-icon.m-r-md').last().scrollIntoView().should('be.visible')
  }

  getEditSegmentBtn() {
    return cy.get('.Segment span[class="segment-edit-icon"]').scrollIntoView().should('be.visible')
  }

  getSegmentName() {
    return cy.get('input[name="name"]').should('be.visible')
  }

  getFirstSegmentCheckbox() {
    return cy.get('.ep-wrapper__table > div:nth-child(1) .group-label  .checkbox:nth-child(1)').should('be.visible')
  }

  getEmptySegment() {
    return cy.get('.ep-wrapper__table > div:nth-child(1) .ep-wrapper__empty-group')
  }

  getHeadingOfEmptySegment() {
    return cy.get('.ep-wrapper__table > div:nth-child(1) h2').should('be.visible')
  }

  getHeadingForSegmentWithExpert() {
    return cy.get('.ep-wrapper__table > div:nth-child(2) h2').should('be.visible')
  }

  getSegmentWithExpert() {
    return cy.get('.ep-wrapper__table > div:nth-child(2) .single')
  }

  getClientFeedbackText() {
    return cy.get('.client-feedback-status > span:nth-child(1)').should('be.visible')
  }

  getClientFeedbackSendOption() {
    return cy.get('.client-feedback-status > span:nth-child(2) span').should('be.visible')
  }

  getClientFeedbackSentText() {
    return cy.get('.client-feedback-status > span:nth-child(2) span:nth-child(1)').should('be.visible')
  }

  getClientFeedbackResentBtn() {
    return cy.get('.client-feedback-status > span:nth-child(2) > span:nth-child(2)')
  }

  getProjectCategory() {
    return cy.get(':nth-child(2) > .row__value').scrollIntoView().should('be.visible')
  }

  getApplicableContracts() {
    return cy.get('.applicable-contracts-label__list--link').scrollIntoView().should('be.visible')
  }

  getContractNameOnSideBar() {
    return cy.get('div.sidebar-wrapper__content h1:nth-child(1) > a:nth-child(1)').should('be.visible')
  }

  getChatRoomName() {
    return cy.get('div.chat-list-wrapper div.room-name').last()
  }

  getLastMessage() {
    return cy.get('div.room-name').last().find('div.last-message')
  }

  getChatIconOnEPL() {
    return cy.get('.epl-chat-wrapper > .MuiSvgIcon-root').should('be.visible')
  }

  addFeedBack(feedback, ratting, comment) {
    cy.get(`div.feedback-form  div  div:nth-child(${feedback}) li:nth-child(${ratting})`)
      .should('be.visible').click()
    cy.get(`div.feedback-form div div:nth-child(${feedback}) textarea`)
      .should('be.visible').type(comment)
  }
  getFeedbackButton() {
    return cy.get('button.feedback__button').should('be.enabled')
  }
  getFeedbackVerification(text) {
    return cy.get('h1.feedback__confirmation-title')
  }
  getClientRating(ratting) {
    return cy.get('div.floating.clickable h1')
  }
  getGivenFeedback() {
    return cy.get('h2.expert-form__subtitle--with-action div.expert-form__subtitle--with-action')
  }

  getSettings() {
    return cy.get('.action > .icon').siblings().contains('Settings')
  }

  getEditPopUp() {
    return cy.get('.expert-form__title').contains('Edit settings')
  }

  getEditCheckbox() {
    return cy.get('[name="clientAuth"]')
  }
  getEditProjectSettingBtn() {
    return cy.get('li[data-cy="edit-project-settings-btn"]')
  }

  getAuthenticationOption(checkboxName) {
    return cy.get(`input[name="${checkboxName}"]`)
  }

  getClientAuthenticationOption() {
    return cy.get('input[name="clientAuth"]')
  }

  getExpertAuthOption() {
    return cy.get('input[name="expertAuth"]').should('be.visible')
  }

  getClientSchedulingEnabled() {
    return cy.get('input[name="enableClientScheduling"]').should('be.visible')
  }

  getExpandIconforClientLink() {
    return cy.get('.links button[aria-label="expand row"]')
  }

  getLinkText() {
    return cy.get('.client-links .MuiCollapse-wrapperInner')
  }

  gerGenericClientLink() {
    return cy.get('.generic-link button[aria-label="expand row"]')
  }

  getMessagingTab(projectid) {
    return cy.get(`a[href*="/project/${projectid}/correspondence"]`)
  }

  getClientAuthClientInterface(projectId, Auth) {

    cy.wait(500)
    cy.waitForLoadingDisappear()
    this.getSettings().click()
    cy.wait('@editSettings')
    this.getEditPopUp().should('be.visible')
    this.getAuthenticationOption(Auth).click()
    this.submitButton().click()
    cy.wait('@saveSettings')
  }
  getLogoutOKButton() {
    return cy.get('[type="button"]').last().click()
  }

  getSettingsTitle() {
    return cy.get('h1.expert-form__title')
  }
  getAvailableTimeSlot() {
    return cy.get('div.availability-timeslot').should('be.visible')
  }
  getScheduledTimeSlot() {
    return cy.get('li.tab__link').contains('Scheduled').should('be.visible')
  }
  getScheduleTimeMessage() {
    return cy.get('div.expert-profile__text--large').last().should('be.visible')
  }
  getScheduleStatusDate() {
    return cy.get('span.schedule-wrapper__date')
  }
  getScheduleStatusTime() {
    return cy.get('span.schedule-wrapper__time')
  }

  getSubmitStatus() {
    return cy.get('form div:nth-child(1).filters-wrapper__group__checkbox:nth-child(1)').eq(0)
  }

  getBulkSelect() {
    return cy.get('.group-label .checkbox__wrapper')
  }

  getCopyExpertMouseHover() {
    return cy.get('span').contains('Copy experts')
  }

  getLastCheckBox() {
    return cy.get('.checkbox').last()
  }
}

export default ProjectDetailsPage

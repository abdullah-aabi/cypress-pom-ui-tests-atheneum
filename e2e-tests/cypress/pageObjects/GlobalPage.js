class GlobalPage {
  getProjectSearchNavItem() {
    return cy
      .get('a.Navbar__item[href = "/project-search"]')
      .should('be.visible')
  }

  getActionButtonByName(actionName) {
    return cy.get('li.action').contains(actionName)
  }

  getLogOutButton() {
    return cy.get('div.single.single--logout').should('exist')
  }

  selectAsPerEnteredText(enteredtext) {
    cy.get('.autocomplete__results-container div').each(($el, index, $list) => {
      const text = $el.text()
      if (text.includes(enteredtext)) {
        cy.get('.autocomplete__results-container div')
          .eq(index)
          .click()
      }
    })
  }

  getNoAttachmentsElement() {
    return cy.get('div.attachment-container > div[class*=attachment] p').should('exist')
  }


  getAttachmentsWrapper() {
    return cy.get('div.attachment-container > div[class*=attachment] a').should('exist')
  }

  getAttachmentsUploadedBy() {
    return cy.get('div.attachment-container > div[class*=attachment] div[class="uploaded-by"]').should('exist')
  }

  getFilterCriteriaSelected() {
    return cy.get('div.autocomplete__tag').should('exist')
  }

  getActionButtonByName(actionName) {
    return cy.get('div.action').contains(actionName).should('exist')
  }

  getButtonByName(actionName) {
    return cy.get('button[class*="button"]').contains(actionName).should('exist')
  }

  getPrimaryButtonByName(actionName) {
    return cy.get('button[class*="button--primary"]').contains(actionName).should('exist')
  }

  getPopupTitle() {
    return cy.get('h2.swal2-title').should('exist')
  }

  getPopupContent() {
    return cy.get('div.swal2-content').should('exist')
  }

  getAttachmentDeleteConfirm() {
    return cy.get('button.swal2-confirm').should('exist')
  }

  clickAttachmentDeleteByFilename(attachmentFile) {
    return this.getAttachmentsWrapper().each(attachment => {
      if (attachment.text() === attachmentFile) {
        cy.get(attachment).parent().find('.delete-icon').invoke('show').click()
      }
    })
  }

  clickCheckBoxWrapperByName(checkBoxName) {
    return cy
      .get('.checkbox__wrapper')
      .contains(checkBoxName)
      .click()
  }

  getClearSearchButton() {
    return cy.get('.search-panel-container__title--action').should('exist')
  }

  clickCheckBoxByName(checkBoxName) {
    return cy
      .get('.checkbox')
      .contains(checkBoxName)
      .click()
  }

  expandFilterMenu(menuName) {
    return cy
      .get('div.search-group h4')
      .contains(menuName)
      .click()
  }

  getHeaderUserName() {
    return cy.get('.header__actions__navigation__user p')
  }

  getStatusLabel() {
    return cy.get('div.status-label').should('be.visible')
  }

  getStatusLabelByPosition(position) {
    return cy.get(`.invoice-title > :nth-child(${1 + parseInt(position)})`).should('be.visible')
  }

  getNotificationTitle() {
    return cy.get('.notification-wrapper__single__title').should('be.visible')
  }

  getCloseNotificationIcon() {
    return cy.get('.notification-wrapper__single__close').should('be.visible')
  }

  getNotificationMessage() {
    return cy.get('.notification-wrapper__single__message').should('be.visible')
  }

  toggleMobileMenu() {
    // return cy.get('.mobile-menu div[class*=jss]').should('be.visible')
    // // .trigger('mousedown', { position: "right" })
    // //   .trigger('mousemove', { clientX: 100, clientY: 275 })
    // //   .trigger('mouseup', { force: true })
    return cy.get('.mobile-menu-section .mobile-menu-icon').first().should('be.visible')
  }

  getHeaders() {
    return cy.get('h2')
  }

  getSearchAnythingInput(mobile) {
    if (mobile) {
      return cy.get('.mobile-search input.search-panel__input ').should('exist')
    }
    return cy.get('.search-panel__input').should('exist')
  }

  getProfileHeaderIcon() {
    return cy.get('.header .header__profile-image').should('exist')
  }

  getMobileSearchAnythingResults() {
    return cy
      .get('.mobile-search-results .SearchItemText > div:first-child')
      .should('be.visible')
  }

  getSearchAnythingResults() {
    return cy
      .get('.search-panel__results-container .SearchItemText > div:first-child')
      .should('be.visible')
  }

  searchAnythingAndSelectValue(searchValue) {
    this.getSearchAnythingInput().type(searchValue)
    this.getSearchAnythingResults()
      .should('contain', searchValue)
      .each($el => {
        if ($el.text().includes(searchValue)) {
          cy.wrap($el).click()
        }
      })
  }

  submitButton() {
    return cy.get('button[type="submit"]')
      .should('be.visible')
  }

  getDateInput() {
    return cy.get('.datepicker').should('be.visible')
  }

  selectCurrentDate() {
    this.getDateInput().click()
    return cy
      .get('[aria-current="date"]')
      .should('be.visible')
      .click()
  }

  getChatMessageIcon() {
    return cy.get('div[class="robot-wrapper"]').should('be.visible')
  }

  getMessageIcon() {
    return cy.get('.chat-icon-wrap').eq(0)
  }

  getWarningModal() {
    return cy.get('.logged-out-warning-modal > .wrap > div')
  }

  getButton(Name) {
    return cy.get('.MuiButton-label').contains(Name)
  }

  getChatRoomName() {
    return cy.get('div.room-name')
  }

  getChatIconByProjectName(projectName) {
    return cy.get('div.sections-one__link').contains(projectName).parent().find('div.chat-icon-wrap')
  }

  getChatRoomNameMessage(roomName) {
    return cy.get('div.room-name').contains(roomName).parent().find('div.last-message')
  }

  getEPLChatIcon() {
    return cy.get('.epl__expert-name > div').eq(1).find('div').should('be.visible')
  }

  getChatBoxHeader() {
    return cy.get('div.chat-header-text').should('be.visible')
  }

  getChatBoxTextarea() {
    return cy.get('div.chat-footer textarea').should('be.visible')
  }

  getChatBoxSendButton() {
    return cy.get('div.chat-footer button').should('be.visible')
  }

  getLastChatMessage() {
    return cy.get('div.last-message div').last()
  }

  getChatMessage() {
    return cy.get('div.last-message div').eq(1)
  }

  getUnseenMessage() {
    return cy.get('.room-name').last().find('.chat-unseen')
  }

  getAllMessagesList() {
    return cy.get('.room-name')
  }

  getChatMessageTree () {
    return cy.get('.robot-wrapper')
  }

  getMessageUnseen () {
    return cy.get('.chat-unseen')
  }

  getBackToMessagesList () {
    return cy.get('.back')
  }

  getUnseenLabelMuiGrid() {
    return cy.get('div.chat-tabs div.MuiGrid-root div.chat-unseen').should('be.visible')
  }

  getUnseenLabelEPL() {
    return cy.get('div.chat-unseen').should('be.visible')
  }

  getUnseenChatWrapper() {
    return cy.get('div.chat-tabs div.chat-list-wrapper div.chat-unseen').should('be.visible')
  }

  getUnseenChatEPLIcon() {
    return cy.get('div.icons__box div.chat-unseen').should('be.visible')
  }

  getUnseenRobotIcon() {
    return cy.get('div.robot-wrapper div.chat-unseen').should('be.visible')
  }

  getCommentIcon() {
    return cy.get('.icons > :nth-child(5)').should('be.visible')
  }

  getPrimaryButton() {
    return cy.get('button.button--primary').should('be.visible')
  }
  getConfirmButton() {
    return cy.get('button.button--primary').scrollIntoView().should('be.visible')
  }
  getSecondaryButton() {
    return cy.get('button.button--secondary').should('be.visible')

  }
  getBackButton() {
    return cy.get('button.button--secondary').contains('Back').scrollIntoView().should('be.visible')

  }
  imageCalenderIcon() {
    return cy.get('div.icon.icon--img.calendar-icon').should('be.visible')

  }
  editTimeSlot() {
    return cy.get('div[title="Edit Timeslot"]').should('be.visible')

  }
  confirmSlotButton() {
    return cy.get('button.button.button--primary').should('be.visible')

  }

  getEPLStatus() {
    return cy.get('button.autocomplete__input--blue')

  }
  getScheduledList() {
    return cy.get('#downshift-4-item-2').should('be.visible')
  }

  getDialogPrimaryButton() {
    return cy.get('div[role="dialog"] button.button--primary').should('be.visible')
  }

  getAddress() {
    return cy.get('input[name="address"]').should('be.visible')
  }

  getCity() {
    return cy.get('input[name="city"]').should('be.visible')
  }

  getZipCode() {
    return cy.get('input[name="zipCode"]').should('be.visible')
  }

  getFormPrimaryButton() {
    return cy.get('div.expert-form button.button--primary').should('be.enabled')
  }
}
export default GlobalPage

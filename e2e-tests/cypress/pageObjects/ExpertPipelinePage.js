class ExpertPipelinPage {
  getFeeCurrencyField() {
    return cy.get('[data-cy="fee-currency-dropdown"]').should('exist')
  }

  getHonCurrencyField() {
    return cy.get('[data-cy="honorarium-currency-dropdown"]').should('exist')
  }

  getAutocompleteItems() {
    return cy
      .get('div.autocomplete__results-container [class*="autocomplete__item"]')
      .should('exist')
  }

  checkEPLRelevantPosition(expertName, relevantPosition) {
    cy.get('.single__content__thumb').contains(expertName)
    cy.get('.single__content__thumb').each(($el, index) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        return cy.get('.single__content__thumb')
          .find('.info__text > div:nth-of-type(2)')
          .eq(index)
          .should('contain.text', relevantPosition)
      }
    })
  }

  checkEPLCurrentTime(expertName, time, ind) {
    cy.get('.single__content__thumb').contains(expertName)
    cy.get('.single__content__thumb').each(($el, index) => {
      const expertNameText = $el.text()

      if (expertNameText.includes(expertName)) {
        return cy.get('.single__content__thumb')
          .find(' .hero-actions .invitation-followup .link-row')
          .eq(ind).then(date => {

            var dateTime = date.text()
            var dateTimeSplit = dateTime.split('at')
            var timeSplit = dateTimeSplit[2].split(' ')
            var currentTime = timeSplit[1]
            expect(currentTime).to.be.oneOf(time)
          })
      }
    })
  }

  getOkayButton() {
    return cy.get('[type="button"]').contains('Ok').click()
  }

  selectCancellationReason(reasonText) {
    cy.get('div.EPLStatusModal__dropdown button.autocomplete__input').should('be.visible').click()
    cy.get('div.EPLStatusModal__dropdown .autocomplete__results-container').contains(reasonText).click()
    return cy.get('div.EPLStatusModal__dropdown button.autocomplete__input').should('have.text', reasonText)
  }

  getCancellationConfirmButton() {
    return cy.get('div.EPLStatusModal button.button--primary').contains('Confirm')
  }

  clickMckButtonByName(buttonName) {
    return cy.get('.resubmit-wrapper button.button').contains(buttonName).click()
  }

  selectFeeCurrencyByValue(currencyValue) {
    this.getFeeCurrencyField().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(currencyValue)) {
        cy.wrap($el).click()
      }
    })
    this.getFeeCurrencyField().should('have.text', currencyValue)
  }

  selectHonCurrencyByValue(currencyValue) {
    this.getHonCurrencyField().click()
    this.getAutocompleteItems().each($el => {
      if ($el.text().includes(currencyValue)) {
        cy.wrap($el).click()
      }
    })
    this.getHonCurrencyField().should('have.text', currencyValue)
  }

  getFeeAmountField() {
    return cy
      .get('[data-cy="fee-amount"]')
      .should('exist')
      .scrollIntoView()
  }

  getFeeCreditsField() {
    return cy
      .get('[name="credits"]')
      .should('exist')
      .scrollIntoView()
  }

  getIconForFeeDescription() {
    return cy.get(
      '.l-flex-row > .checkbox__wrapper > .iconWrapper > div.icon > .icon'
    )
  }

  getEplStatusConfirmButton() {
    return cy
      .get('div[class*="-modal"] [class*="-confirm"]')
      .should('be.visible')
  }

  getBundleCreate() {
    return cy.get('span.message__action').should('be.visible')
  }

  getEplByExpertName(expertName) {
    cy.get('.single__content__thumb').should('be.visible')
    return cy.get('.single__content__thumb').contains(expertName).scrollIntoView()
  }

  getEplPopupSave() {
    return cy.get('.expert-form__section .button--primary').scrollIntoView()
  }

  getEPLPopupHideScreening() {
    return cy.get('[data-cy=toggle-hide-screening]')
  }

  getEPLPopupHideAvailability() {
    return cy.get('[data-cy=toggle-hide-expertAvailability]')
  }

  getEPLPopupHidePosition() {
    return cy.get('[data-cy=toggle-hide-position]')
  }

  getEPLPopupHideCompanyName() {
    return cy.get('[data-cy=toggle-hide-companyName]')
  }

  getEPLPopupHideDate() {
    return cy.get('[data-cy=toggle-hide-date]')
  }

  getEPLPopupHideFee() {
    return cy.get('[data-cy=toggle-hide-fee]')
  }

  getEPLPopupHideIndustryExpertise() {
    return cy.get('[data-cy=toggle-hide-industryExpertise]')
  }

  getEPLPopupHideLanguage() {
    return cy.get('[data-cy=toggle-hide-languages]')
  }

  getEPLPopupHideRecordings() {
    return cy.get('[data-cy=toggle-hide-recordings]')
  }

  getEPLPopupHideExperience() {
    return cy.get('.hide-show-all-position-icon')
  }

  getEmployeeUnitsField() {
    return cy.get('input[placeholder*="Select employee"]').should('be.visible')
  }

  getEyeIcon() {
    return cy.get('.tooltip-wrapper .icon')
  }

  getDelieveredByField() {
    return cy.get('.actions__single.m-t-md input')
  }

  getDataOnEplByEplid(epl) {
    return cy.get(`.actions [data-cy-epl="${epl}"] .schedule-wrapper__date`)
  }

  getTimeOnEplByEplid(epl) {
    return cy.get(`.actions [data-cy-epl="${epl}"] .schedule-wrapper__time`)
  }

  getMultiExpertActionButton() {
    return cy.get('.multiExpertTitle button')
  }

  getMultiExpertActionOptionToComplete() {
    return cy.get('.multiExpertActionContainer p:nth-child(1)')
  }

  getMultiExpertActionOptionToReschedule() {
    return cy.get('.multiExpertActionContainer p:nth-child(2)')
  }

  getEPL() {
    return cy.get('.single__content__thumb').should('be.visible')
  }

  getBainStatus(CIDStatus) {
    return cy.get(`.resubmit-wrapper > button:nth-child(${CIDStatus})`)
  }

  getEPLCommentBox(comment) {
    return cy.get('div.fr-wrapper.show-placeholder').should('be.visible').type(comment)
  }
  getEPLUnreadCommentBox() {
    return cy.get('div.icons__box.comments-unread').should('be.visible')
  }
  getEPLCommentTitle(title) {
    return cy.get('span.user-full-name').should('have.text', title)
  }
  getEPLCommentStatus(status) {
    return cy.get('span.user-action').last().should('have.text', status)
  }
  getEplCommentVerified(comment) {
    return cy.get('div.comments-wrapper__comment__content__text').last().should('have.text', comment)
  }
  getEPLCommentTime() {
    return cy.get('span.user-posted-date')
  }

  getDialogHeader() {
    return cy.get('.expert-form__title').should('be.visible')
  }
  getSchedulingButton() {
    return cy.get('div[data-cy="open-scheduling-tool-btn"]')
  }
  getSchedulingTitle() {
    return cy.get('div.schedule-calendar-modal .overview-title h4')
  }
  getCloseButton() {
    return cy.get('button.button--secondary').contains('Close')
  }
  getEplList() {
    return cy.get('div.autocomplete__item')
  }

}

export default ExpertPipelinPage

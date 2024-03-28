class AthenaListsPage {
    getListHeading() {
        return cy.get('h1').should('be.visible')
    }

    getCreateListBtn() {
        return cy.get('.MuiCardContent-root').first().should('be.visible')
    }

    getListNameOnCard() {
        return cy.get('input[placeholder="My List"]')
    }

    getNewListNameOnCard() {
        return cy.get('.MuiGrid-root.MuiGrid-item:nth-child(2) input').should('be.visible')
    }

    getViewButtonOnCard(listId) {
        return cy.get(`a[href="/list/${listId}"] button`)
    }

    getDeleteIconOnCard() {
        return cy.get('[title="Remove list"]').should('be.visible')
    }

    getDeleteIconInList() {
        return cy.get('span[title="Remove list"]').should('be.visible')
    }

    getOwnerOnCard() {
        return cy.get('.al_list_owner_qa').should('be.visible')
    }

    getExpertCountOnCard() {
        return cy.get('.al_expert_count_qa').should('be.visible')
    }

    getOwnderIntitalsOnList() {
        return cy.get(' .employee-initials-badge span').should('be.visible')
    }

    getOwnderIntitalsOnCard() {
        return cy.get('.MuiGrid-root.MuiGrid-item:nth-child(2) .employee-initials-badge span').should('be.visible')
    }

    getExpertCountOnList() {
        return cy.get('.mp-list-details p strong').first().should('be.visible')
    }

    getCreatedDateOnList() {
        return cy.get('.mp-list-details p').last().should('be.visible')
    }

    getCompany() {
        return cy.get('.ag-row-even div[col-id="company"]').should('be.visible')
    }

    getPosition() {
        return cy.get('.ag-row-even div[col-id="position"]').should('be.visible')
    }

    getSurvey() {
        return cy.get('input[placeholder="surveyUUID"]').should('be.visible')
    }

    getSearchIcon() {
        return cy.get('input[placeholder="Search"]').should('be.visible')
    }

    getAddRowIcon() {
        return cy.get('svg[title="Add Expert"]').should('be.visible')
    }


    getDeleteIconOnARow() {
        return cy.get('.ag-row-even div[col-id="actions"] button').should('be.visible')
    }

    getAddColumnAction() {
        return cy.get('.MuiButtonBase-root span:nth-child(1)').contains('Add Column').should('be.visible')
    }

    getDeleteColumnBtn() {
        return cy.get('.ag-menu-option span[ref="eName"]').contains('Delete Column').should('be.visible')
    }

    getAddTitleForNewColumn() {
        return cy.get('form .MuiFormControl-root.MuiTextField-root input').first().should('be.visible')
    }

    getDataFieldForNewColumn(){
        return cy.get('form .MuiFormControl-root.MuiTextField-root input').last().should('be.visible')
    }

    selectFieldName(data) {
        this.getDataFieldForNewColumn().type(data)
        this.getAutoComplete().each($el => {
            if ($el.text() === data) {
                cy.wrap($el).click()
            }
        })
    }

    getAddNameForNewColumn() {
        return cy.get('form .MuiFormControl-root.MuiTextField-root input').last().should('be.visible')
    }

    getSubmitButton() {
        return cy.get('button[type="submit"]').should('be.visible')
    }

    getAddedColumn(addedcolumn) {
        return cy.get(`input[placeholder="${addedcolumn}"]`)
    }

    getShareIcon() {
        return cy.get('.mass-processing-shareContainer button:nth-child(1) span').contains('Share').should('be.visible')
    }

    getAddedDataField(addedValue) {
        return cy.get(`input[value="${addedValue}"]`).should('be.visible')
    }

    getSearchFieldForShare() {
        return cy.get('input[placeholder="Search"]').last().should('be.visible')
    }

    getAutoComplete() {
        return cy.get('[id$=-option-0]').should('exist')
    }

    selectSearchEmployee(name) {
        this.getSearchFieldForShare().type(name)
        this.getAutoComplete().each($el => {
            if ($el.text() === name) {
                cy.wrap($el).click()
            }
        })
    }

    getColumnName() {
        return cy.get('.ag-header-container .ag-header-row div.ag-header-cell span[ref="eText"]')
    }

    getDeleteConfirmationButton() {
        return cy.get('button[type="button"] span').contains('Delete').should('be.visible')
    }

    getCountOfExpertAfterAdding() {
        return cy.get(' .mp-list-details p').should('be.visible')
    }

    getALCell() {
        return cy.get('.ReactVirtualized__Grid:nth-child(2)').should('be.visible')
    }

    getSelectOption() {
        return cy.get('.MuiSelect-root').should('be.visible')
    }

    getNextBtnForEmail() {
        return cy.get('.surveyActionContainer .MuiButton-label').contains('Next').should('be.visible')
    }

    getAddToProjectBtn() {
        return cy.get('.MuiButton-label').contains('Add to Project').should('be.visible')
    }

    deleteColumn(columnName) {
        this.getColumnName().contains(columnName).find('svg').then(($el) => {
            cy.wrap($el).click()
        })
    }

    cancelEdit() {
        return cy.get('.listViewContainer-inner span').contains('Cancel Edit').should('be.visible')
    }

    getStopBtn() {
        return cy.get('.MuiButton-label').contains('Stop').should('be.visible')
    }

    getSearchFieldForSurvey() {
        return cy.get('.surveyActionContainer input[id^=mui-]').should('be.visible')
    }

    selectSearchSurvey(surveyName) {
        this.getSearchFieldForSurvey().type(surveyName)
        this.getAutoComplete().each($el => {
            if ($el.text() === surveyName) {
                cy.wrap($el).click()
            }
        })
    }

    getNextBtn() {
       return cy.get('div.surveyActionContainer div:nth-child(2) div:nth-child(1) > span.al-text-button:nth-child(6)')
        .should('be.visible')
    }

    getSendBtn() {
        return cy.get('.al-text-button').contains('Send').should('be.visible')
    }

    getAthenaList() {
        return cy.get('#free-solo-with-text-demo').should('be.visible')
    }

    selectNewList(listName) {
        this.getAthenaList().type(listName)
        this.getAutoComplete().each($el => {
            if ($el.text().includes(listName)) {
                cy.wrap($el).click()
            }
        })
    }

    getMoveBtn() {
        return cy.get('.al-text-button').first()
    }

    getItemRows() {
        return cy.get('.ag-center-cols-clipper .ag-row-even')
    }

    getGoToListBtn() {
        return cy.get('.surveyActionContainer .MuiButton-label').should('be.visible')
    }

    getFirstNameInAddedRow() {
        return cy.get('.ag-row-even div[col-id="firstName"]').should('be.visible')
    }

    getLastNameInAddedRow() {
        return cy.get('.ag-row-even div[col-id="lastName"]').should('be.visible')
    }

    getEmailInAddedRow() {
        return cy.get('.ag-row-even div[col-id="formatted.emails"]').should('be.visible')
    }

    getPreviewBtn() {
        return cy.get('.ms-email-template-actions-switch div > span > span:nth-child(1)').scrollIntoView()
    }

    getPreviewTxt() {
        return cy.get('.ms-email-template-actions-switch div').should('be.visible')
    }

    getExpandBtnForEmailDetail() {
        return cy.get('.MuiButtonBase-root.MuiAccordionSummary-root svg')
    }

    getEmailTo() {
        return cy.get('.ms-email-template-subject-container .MuiChip-deletable span')
    }

    getEmailTitle() {
        return cy.get('[title="lastName"]')
    }

    nextBtnOnPreview() {
        return cy.get('.ms-email-template-actions-switch .MuiSvgIcon-root')
    }

    getEmailSendBtn() {
        return cy.get('.mp-send-email-action-button-container button')
    }

    statusForEmailAction() {
        return cy.get('.removeScrollBar .mass-processing--field:nth-child(1) > div > div:nth-child(1) div div')
    }

    getCreaeAllBtn() {
        return cy.get('.al-text-button')
    }

    getProcessingSurvey() {
        return cy.get('.surveyActionContainer > div:nth-child(2) div')
    }

    getStatus() {
        return cy.get('.ag-row-even div[col-id="status"]')
    }

    getSelectAll() {
        return cy.get('.titleListView .MuiButton-label').contains('Select All').should('be.visible')
    }

    getEmailCountOnPreview() {
        return cy.get('.ms-email-template-actions-switch').scrollIntoView().should('be.visible')
    }

    getWithStatus() {
        return cy.get('.MuiButton-label').contains('With status').should('be.visible')
    }

    getWithoutStatus() {
        return cy.get('.MuiButton-label').contains('Without status').should('be.visible')
    }

    getSearchList() {
        return cy.get('input[placeholder="Search Lists"]').should('be.visible')
    }

    getBackIconOnList() {
        return cy.get('a[title="Back to Lists Overview"]').should('be.visible')
    }

    getRetryBtn() {
        return cy.get('.ag-row-even div[col-id="status"]  button').should('be.visible')
    }

    getSherlockText() {
        return cy.get('.MuiDialogContent-root input[type="text"]').should('be.visible')
    }

    getSherlockCommentSubmitBtn() {
        return cy.get('.MuiButton-label').contains('Ok').should('be.visible')
    }

    getFollowUpOption () {
        return cy.get('.mp-flex-row .MuiIconButton-label').should('be.visible')
    }

    getAddRowBtn () {
        return cy.get('.mass-processing--field-actions svg').should('be.visible')
    }

    getEmailField () {
        return cy.get('.ag-row-even div[col-id="formatted.emails"] input')
    }

    selectColumMenu () {
      return  cy.get('.ag-header-container .ag-header-row div.ag-header-cell:nth-child(12) .ag-icon-menu').scrollIntoView()
    }

    selectTemplate () {
        this.getTemplate().click()
        this.getSecondTemplate().click()
    }

    getTemplate () {
        return cy.get('input[value ="First Outreach Template 1"]')
    }

    getSecondTemplate() {
        return cy.get('[id$=-option-1]').should('exist')
    }

    getTemplateType () {
        return cy.get('input[value="Standard"]')
    }

    getPlaceholder() {
        return  cy.get('.ms-email-section  strong:nth-child(1)')
    }
}

export default AthenaListsPage

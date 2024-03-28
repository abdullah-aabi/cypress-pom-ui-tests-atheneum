class ClientRecordsPage {

    getCreateParentAccountBtn() {
        return cy.get('[data-cy=create-parent-account-btn]')
    }

    getPArentAccountNameField() {
        return cy.get('[name="parentAccountName"]')
    }

    getParentAccountCodeField() {
        return cy.get('[name="parentAccountCode"]')
    }

    getParentAccountTypeDropdown() {
        return cy.get('[data-cy="account-type-dropdown"]')
    }

    selectAsPerText(enteredtext) {
        cy.get('.autocomplete__results-container div').each(($el, index, $list) => {
            const text = $el.text()
            if (text.includes(enteredtext)) {
                cy.get('.autocomplete__results-container div')
                    .eq(index)
                    .click()
            }
        })
    }

    getOperationalGuidelineForParentAccountField() {
        return cy.get(':nth-child(6) > .expert-form__input-wrapper .fr-element')
    }

    getDisclaimerCommentForParentAccountField() {
        return cy.get(':nth-child(7) > .expert-form__input-wrapper .fr-element')
    }

    getShowSubmittedExpertCheckboxOnParentAccount() {
        return cy.get('[name ="expertsDisclosed"]')
    }

    getCaseCodeRequiredCheckboxOnParentAccount() {
        return cy.get('[name="caseCodeRequired"]')
    }

    selectInvoicingCoverageForParentAccount() {
        return cy.get('.radio-group__container div.radio-group__item:nth-child(2)')
    }

    getSaveButton() {
        return cy.get('[type ="submit"]')
    }

    getNameOnHeading() {
        return cy.get('.name-status-wrapper > h1').should('be.visible')
    }

    getCode() {
        return cy.get('.code-label').should('be.visible')
    }

    getOperationalGuideline() {
        return cy.get(':nth-child(1) > .text')
    }

    getDisclaimerComment() {
        return cy.get(':nth-child(2) > .text')
    }

    getExternalComplianceVerification() {
        return cy.get(':nth-child(3) > .text')
    }

    getParentAccountType() {
        return cy.get(':nth-child(1) > .row__value')
    }

    getParentAccountInvoicingCoverage() {
        return cy.get(':nth-child(2) > .row__value')
    }

    getParentAccountCaseCode() {
        return cy.get(':nth-child(4) > .row__value')
    }

    getShowSubmittedExpertOnParentAccount() {
        return cy.get(':nth-child(5) > .row__value')
    }

    getDeleteConfirmationBtn() {
        return cy.get('.swal2-confirm')
    }

    getAddAccountBtn() {
        return cy.get('[data-cy=create-account-btn]')
    }

    getDisplayNameForParentAccount() {
        return cy.get(':nth-child(1) > .expert-form__value-wrapper')
    }

    getAccountNameWithoutCountry() {
        return cy.get(':nth-child(3) > .expert-form__input-wrapper > .expert-form__input')
    }

    getCountryField() {
        return cy.get('[data-cy=country-autocomplete]')
    }

    getAtheneumCompanyField() {
        return cy.get('[data-cy=atheneum-office-autocomplete]')
    }

    getAtheneumContactField() {
        return cy.get('.expert-form .expert-form__section:nth-child(1) .expert-form__input-group:nth-child(7) input')
    }

    getOperationalGuidelineForAccount() {
        return cy.get('.fr-element')
    }

    getKeyAtheneumContact() {
        return cy.get(':nth-child(2) > .row__value')
    }

    getAtheneumCompany() {
        return cy.get(':nth-child(1) > .row__value')
    }

    getCreateOfficeBtn() {
        return cy.get('[data-cy=create-office-btn]')
    }

    getCityForOfficeField() {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group:nth-child(6) .expert-form__input-group:nth-child(3) .autocomplete__container ')
    }

    getState() {
        return cy.get(':nth-child(4) > .expert-form__input-wrapper > .expert-form__label')
    }
    getCountry() {
        return cy.get(':nth-child(5) > .expert-form__input-wrapper > .expert-form__label')
    }
    getTimeZone() {
        return cy.get(':nth-child(6) > .expert-form__input-wrapper > .expert-form__label')
    }

    getCityForOffice() {
        return cy.get(':nth-child(3) > .row__value')
    }

    getStateForOffice() {
        return cy.get(':nth-child(5) > .row__value')
    }

    getCountryForOffice() {
        return cy.get(':nth-child(6) > .row__value')
    }
    getTimeZoneForOffice() {
        return cy.get(':nth-child(7) > .row__value')
    }

    getAddClientContactBtn() {
        return cy.get(':nth-child(1) > .action > span')
    }

    getClientContactTitle() {
        return cy.get('[data-cy=title-dropdown]')
    }

    getClientContactFirstNameField() {
        return cy.get('[name="firstName"]')
    }

    getClientContactLastNameField() {
        return cy.get('[name="lastName"]')
    }

    getAutoCompleteOffice() {
        return cy.get('[data-cy="client-office-autocomplete"]')
    }

    getAutoCompleteAccount() {
        return cy.get('[name="client.account.companyName"]')
    }

    getPhoneNumberField() {
        return cy.get('[name="address.phones[0].phoneNum"]')
    }

    getEmailField() {
        return cy.get('[name="email"]')
    }

    getClientPhoneNumber() {
        return cy.get('.col-2--padding > .story > .group-wrapper > .group > :nth-child(1) > .row__value')
    }

    getClientContactEmail() {
        return cy.get('.row__value > a')
    }

    getClientContactOFfice() {
        return cy.get(':nth-child(1) > .story > .group-wrapper > .group > :nth-child(3) > .row__value')
    }

    getClientContactAccount() {
        return cy.get(':nth-child(1) > .story > .group-wrapper > .group > :nth-child(4) > .row__value')
    }

    getClientContactCity() {
        return cy.get(':nth-child(5) > .row__value')
    }

    getClientContactState() {
        return cy.get(':nth-child(7) > .row__value')
    }

    getClientContactCountry() {
        return cy.get(':nth-child(8) > .row__value')
    }

    getClientContactTimezone() {
        return cy.get(':nth-child(9) > .row__value')
    }

    getOfficeBtn () {
        return cy.get('.Office')
    }

    getSearchClientRecord () {
        return cy.get('.autocomplete__input')
    }

    getSearchIcon () {
        return cy.get('.button--primary svg')
    }

    getSearchResults () {
        return cy.get('.client-search-list-item p')
    }

    getAccountBtn () {
        return cy.get('.Account')
    }

    getAccountResults () {
        return cy.get('.client-search-list-item--account')
    }

    getClearSearchBtn () {
        return cy.get('.row--link')
    }

    getParentAccountBtn () {
        return cy.get('.Parent')
    }

    getParentAccontResults () {
        return cy.get('.client-search-list-item--parentaccount')
    }

    getParentAccountEditBtn (){
        return cy.get('[data-cy=edit-parent-account-btn] > .action > span')
    }

    getAccountEditBtn () {
        return cy.get('[data-cy=edit-account-btn] > .action > span')
    }

    getExternalComplianceCheckboxForAccount () {
        return cy.get('.checkbox')
    }

    getAccounNameOnAccountEditPage () {
        return cy.get('[name="companyName"]')
    }

    getKeyAtheneumContactOnAccountEditPage () {
        return cy.get('[value="Test AccountManager"]')
    }

    getOfficeEditBtn () {
        return cy.get('[data-cy=edit-office-btn] > .action > span')
    }

    getOfficeNameOnOfficeEditPage () {
        return cy.get('[name="officeName"]')
    }

    getCityOnOfficeEditPage () {
        return cy.get('input[value="Berlin"]')
    }

    getClientContactEditBtn () {
        return cy.get('[data-cy=edit-client-btn] > .action > span')
    }

    selectAsPerExactText(enteredText) {
        cy.get('.autocomplete__results-container div').each(($el, index, $list) => {
            const text = $el.text()
            if (text === enteredText) {
                cy.get('.autocomplete__results-container div')
                    .eq(index)
                    .click()
            }
        })
    }
}
export default ClientRecordsPage
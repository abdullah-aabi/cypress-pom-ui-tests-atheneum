class ExpertsAppPage {
    getConsultationCard() {
        return cy.get('.consultations-card__info').should('be.visible')
    }

    getPastConsultationsLink() {
        return cy.get('.Navbar > [href="/past-consultations"]').should('be.visible')
    }

    getPastConsultationProjectName() {
        return cy.get('div.m-table__item').first().find(':nth-child(1) > .m-table__td').should('be.visible')
    }

    getPastConsultationHonorarium() {
        return cy.get('div.m-table__item').first().find(':nth-child(3) > .m-table__td').should('be.visible')
    }

    getPastConsultationPaymentStatus() {
        return cy.get('div.m-table__item').first().find(':nth-child(4) > .m-table__td > .status-label').should('be.visible')
    }

    getScheduledConsultationCard() {
        return cy.get('.consultations-card--scheduled')
            .should('be.visible')
            .find('div.consultations-card__title')
            .should('be.visible')
    }

    getConsultationCardTitleInvitations() {
        return cy.get('.consultations-card.consultations-card--available .consultations-card__title')
    }

    getConsultationCardTitle() {
        return cy.get('.consultations-card__title').should('be.visible')
    }

    getConsultationCardDescription() {
        return cy.get('.consultations-card__description').should('be.visible')
    }

    getConsultationCardApplyLink() {
        return cy.get('.consultations-card__contact--left .link').should('be.visible')
    }

    getPastConsultationsProjectTitle() {
        return cy.get('.m-table_item .m-table__container:first .m-table__td').should('be.visible')
    }

    getPastConsultationsValuesByProjectName() {
        return cy.get('.m-table_item .m-table__container:first .m-table__td').should('be.visible')
    }

    getComplianceButton(labelButton) {
        return cy.get('button.MuiButton-root .MuiButton-label').contains(labelButton).should('be.visible')
    }

    getAddPaymentDetails() {
        return cy.get('.missing-payment-details__info > .button').should('be.visible')
    }

    getInputByParentName(parentName) {
        return cy
            .get('.expert-form__label')
            .contains(parentName)
            .parent()
            .find('.autocomplete__input')
    }

    getAutocompleteItems() {
        return cy
            .get('div.autocomplete__results-container [class*="autocomplete__item"]')
            .should('exist')
    }

    selectSendComplianceRequestEmail(language) {
        cy.get('.compliance__container button').should('be.visible').click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(language)) {
                cy.wrap($el).click()
            }
        })
    }

    selectPaymentDetailsServiceType(serviceType) {
        this.getInputByParentName('Payment service type').click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(serviceType)) {
                cy.wrap($el).click()
            }
        })
    }

    selectPaymentDetailsTransferMethod(transferMethon) {
        this.getInputByParentName('Payment transfer method').click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(transferMethon)) {
                cy.wrap($el).click()
            }
        })
    }

    selectPaymentDetailsCountry(country) {
        this.getInputByParentName('Country').click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(country)) {
                cy.wrap($el).click()
            }
        })
    }
    selectPaymentCountry(country) {
        this.getInputByParentName('Country').clear().type(country).click()
        cy.get('div.autocomplete__item').contains(country).click()
    }

    selectPaymentDetailsBankCountry(country) {
        this.getInputByParentName('Bank country').click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(country)) {
                cy.wrap($el).click()
            }
        })
    }

    selectPaymentDetailsVATClass(vatClass) {
        this.getInputByParentName('VAT class').click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(vatClass)) {
                cy.wrap($el).click()
            }
        })
    }

    getPaymentDetailsInvoiceNeeded() {
        return cy.get('.radio-group__item__label').should('be.visible')
    }

    getPaymentDetailsCompanyName() {
        return cy.get('[name="companyName"]').should('be.visible')
    }

    getPaymentDetailsVATNumber() {
        return cy.get('[name="vatNumber"]').should('be.visible')
    }

    getPaymentDetailsAddress() {
        return cy.get('[name="expert.address.address1"]').should('be.visible')
    }

    getPaymentDetailsBankAddress() {
        return cy.get('[name="bankAddress.address1"]').should('be.visible')
    }

    getPaymentDetailsBankCity() {
        return cy.get('[name="bankAddress.city"]').should('be.visible')
    }

    getPaymentDetailsBankPostalCode() {
        return cy.get('[name="bankAddress.postalCode"]').should('be.visible')
    }

    getPaymentDetailsBankState() {
        return cy.get('[name="bankAddress.state"]').should('be.visible')
    }




    getPaymentDetailsCheckAddress() {
        return cy.get('[name="checkAddress.address1"]').should('be.visible')
    }

    getPaymentDetailsCheckCity() {
        return cy.get('[name="checkAddress.city"]').should('be.visible')
    }

    getPaymentDetailsCheckPostalCode() {
        return cy.get('[name="checkAddress.postalCode"]').should('be.visible')
    }

    getPaymentDetailsCheckState() {
        return cy.get('[name="checkAddress.state"]').should('be.visible')
    }

    getPaymentDetailsBankComment() {
        return cy.get('[name="comment"]').should('be.visible')
    }

    getPaymentDetailsCity() {
        return cy.get('[name="expert.address.city"]').should('be.visible')
    }

    getPaymentDetailsPostalCode() {
        return cy.get('[name="expert.address.postalCode"]').should('be.visible')
    }

    getPaymentDetailsState() {
        return cy.get('[name="expert.address.state"]').should('be.visible')
    }

    getPaymentDetailsAccountOwner() {
        return cy.get('[name="accountOwner"]').should('be.visible')
    }

    getPaymentDetailsAccountNumber() {
        return cy.get('[name="accountNumber"]').should('be.visible')
    }

    getPaymentDetailsBankCode() {
        return cy.get('[name="bankCode"]').should('be.visible')
    }

    getPaymentDetailsBankName() {
        return cy.get('[name="bankName"]').should('be.visible')
    }

    getPaymentDetailsSaveButton() {
        return cy.get('.button[type=submit]').should('be.visible')
    }

    getPaymentDetailsPopupMessage() {
        return cy.get('#swal2-title').should('be.visible')
    }

    getPaymentDetailsStatus() {
        return cy.get('div.status-label').should('be.visible')
    }

    getPaymentDetailsValueByLabel(label) {
        return cy.get('span.info-wrapper__row__name').contains(label).parent().find('span.info-wrapper__row__value')
    }
    getPaymentDetailsValue(label) {
        return cy.get('span.row__name').contains(label).parent().find('span.row__value')
    }

    getPaymentDetailsEdit() {
        return cy.get('.payment-details__header__action .link').should('be.visible')
    }

    getComplianceDeclineMessage() {
        return cy.get('#swal2-content').should('be.visible')
    }

    getComplianceDeclineConfirmButton() {
        return cy.get('.swal2-confirm').should('be.visible')
    }

    getLoginEmailInput() {
        return cy.get('input[name=login]')
    }

    getLoginPasswordInput() {
        return cy.get('input[name="password"]')
    }

    getButtonByName(buttonName) {
        return cy.get('div.expert-form-login__input-group button').contains(buttonName)
    }

    getForgotPasswordLink() {
        return cy.get('div.link').contains('Forgot password')
    }

    getWelcomeMessage() {
        return cy.get('.welcome-title')
    }

    getTitle() {
        return cy.get(
            'button.autocomplete__input'
        ).should('exist')
    }

    selectTitle(title) {
        this.getTitle().click()
        this.getAutocompleteItems().each(($el, index) => {
            if ($el.text().includes(title)) {
                cy.wrap($el).click()
            }
        })
    }

    getLabelBlack() {
        return cy.get('div.expert-form__label--black')
    }

    getFirstName() {
        return cy.get('input[name="firstName"]')
    }

    getLastName() {
        return cy.get('input[name="lastName"]')
    }

    getPasswordRepeat() {
        return cy.get('input[name="passwordRepeat"]')
    }

    getComplianceHeader() {
        return cy.get('p.MuiTypography-root.welcome-text')
    }

    getExpertConfirmInputFieldByName(fieldName, type = 'input') {
        return cy.get('p.MuiTypography-root.label').contains(fieldName).parent().find(`${type}.MuiInputBase-input`)
    }

    selectAtheneumContact(employeeName) {
        cy.get('.expert-form__input--autocomplete input').type(`${employeeName}{enter}`)
        return cy.get('.expert-form__input--autocomplete input').should('have.attr', 'value', employeeName)
    }

    getNameOfContact() {
        return cy.get('[id="downshift-0-input"]')
    }

    getAutoComplete() {
        return cy.get('.autocomplete__results-container').should('exist')
    }

    selectTestAccountMAnager(name) {
        this.getNameOfContact().type(name)
        this.getAutoComplete().each($el => {
            if ($el.text() === name) {
                cy.wrap($el).click()
            }
        })
    }

    getExpertComplianceEmailAddress() {
        return cy.get('[name=email]').should('be.visible')
    }

    getExpertComplianceNextButton() {
        return cy.get('.button.button--red').should('be.visible')
    }

    getPrivacyPolicy() {
        return cy.get("a[href*='/static/media/AthenumPrivacyPolicy']")
    }

    getPrivacyPolicyLink() {
        return cy.get("a[href*='/static/media/AthenumPrivacyPolicy']").invoke('attr', 'href')
    }

    getPrivacyPolicyNotice() {
        return cy.get("a[href*='/static/media/AtheneumPrivacyPolicyNotice_")
    }

    getPrivacyPolicyNoticeLink() {
        return cy.get("a[href*='/static/media/AtheneumPrivacyPolicyNotice_").invoke('attr', 'href')
    }

    getAgree() {
        return cy.get('button > .MuiButton-label').eq(0)
    }
    getExpertComplianceText() {
        return cy.get('.expert-compliance-text').should('be.visible')
    }

    getExpertComplianceAgreementText() {
        return cy.get('.expert-compliance-agreement-text').should('be.visible')
    }

    getSignOutBtn() {
        return cy.get('.single .icon svg').should('be.visible')
    }

    getExpertName() {
        return cy.get('.header__profile-text').should('be.visible')
    }

    getLoginErrorMessage() {
        return cy.get('.info-box-wrapper__rows').should('be.visible')
    }

    getRecruitedBy() {
        return cy.get('.row__name').contains('Recruited by').siblings()
    }

    getLoginAs() {
        return cy.get('span').contains('Login as')
    }

    getQuickLoginLink() {
        return cy.get('.word-break-all')
    }

    getCopyExistingAddressBtn() {
        return cy.get('button[type="button"]').contains('Copy existing address')
    }

    getCheckAddress() {
        return cy.get('input[name="checkAddress.address1"]')
    }

    getCheckCity() {
        return cy.get('input[name="checkAddress.city"]')
    }

    getCheckPostalCode() {
        return cy.get('input[name="checkAddress.postalCode"]')
    }

    getCheckState() {
        return cy.get('input[name="checkAddress.state"]')
    }
}

export default ExpertsAppPage

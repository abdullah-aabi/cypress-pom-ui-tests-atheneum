class ContractPage {

    getCreateNewContractBtn () {
        return cy.get('.button').contains('Create new contract').should('be.visible')
    }

    getParentAccountField () {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group--relative:nth-child(1) .autocomplete__container input')
            .should('exist')
    }

    getAutocompleteItems () {
        return cy
            .get('div.autocomplete__results-container [class*="autocomplete__item"]')
            .should('exist')
    }

    selectParentAccountName (parentAccountName) {
        this.getParentAccountField().type(parentAccountName)
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(parentAccountName)) {
                cy.wrap($el).click()
            }
        })
        this.getParentAccountField().should('have.value', parentAccountName)
    }

    getAteneumContractParty () {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group:nth-child(4) .autocomplete__container button')
    }

    selectAtheneumContractParty (AtheneumContractParty) {
        this.getAteneumContractParty().click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(AtheneumContractParty)) {
                cy.wrap($el).click()
            }
        })
        this.getAteneumContractParty().contains(AtheneumContractParty)
    }

    getSignedByField () {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group:nth-child(5) .autocomplete__container input')
    }

    selectSignedBy (AtheneumContact) {
        this.getSignedByField().clear().type(AtheneumContact)
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(AtheneumContact)) {
                cy.wrap($el).click()
            }
        })
    }

    getContractCoverageField () {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group:nth-child(6) .autocomplete__container button')
    }

    selectContractCoverage (contractCoverageType) {
        this.getContractCoverageField().click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(contractCoverageType)) {
                cy.wrap($el).click()
            }
        })
        this.getContractCoverageField().contains(contractCoverageType)
    }

    getSpecificAccountOrProject () {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group:nth-child(7) .autocomplete__container input')
    }

    selectAccountOrProject (specificCovergageFor) {
        this.getSpecificAccountOrProject().type(specificCovergageFor)
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(specificCovergageFor)) {
                cy.wrap($el).click()
            }
        })
        this.getSpecificAccountOrProject().should('have.value', specificCovergageFor)
    }

    getContractTypeFieldForSpecific () {
        return cy.get(' div.expert-form__input-wrapper.expert-form__input-wrapper:nth-child(1) div.autocomplete__container > button')
    }

    getContractTypeFieldForGLobal () {
        return cy.get('.expert-form__section:nth-child(1) .expert-form__input-group:nth-child(7) .autocomplete__container')
    }

    selectContractTypeForSpecific (contractType) {
        this.getContractTypeFieldForSpecific().click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(contractType)) {
                cy.wrap($el).click()
            }
        })
        this.getContractTypeFieldForSpecific().contains(contractType)
    }

    getSignedCheckbox () {
        return cy.get('input[name="signed"]').should('be.visible')
    }

    getStartDateForPAYG () {
        return cy.get('div.expert-form__input-wrapper:nth-child(1) div.datepicker__wrapper > input.datepicker.flatpickr-input')
    }

    getEndDateForPAYG () {
        return cy.get('div.expert-form__input-wrapper:nth-child(3) div.datepicker__wrapper > input.datepicker.flatpickr-input')
    }

    selectTodayDate () {
        return cy.get('.open > .flatpickr-innerContainer > .flatpickr-rContainer > .flatpickr-days > .dayContainer > .today')
    }

    selectNextYear () {
        return cy.get('.open > .flatpickr-months > .flatpickr-next-month > svg')
    }

    selectEndDate () {
        return cy.get('.open .flatpickr-innerContainer > .flatpickr-rContainer > .flatpickr-days > .dayContainer > span[aria-label*="25"]')
    }

    selectStartEndDateForPAYG () {
        this.getStartDateForPAYG().click()
        this.selectTodayDate().click()
        this.getEndDateForPAYG().click()
        this.selectNextYear().click()
        this.selectEndDate().last().click()
    }

    priceRangeFromField () {
        return cy.get('input[name="rangeMin"]')
    }

    priceRangeToField () {
        return cy.get('input[name="rangeMax"]')
    }

    selectUnlimitedTotalValue () {
        return cy.get('input[name="unlimited"]')
    }

    currencyFieldForRangeTotal () {
        return cy.get(' div.expert-form__input-wrapper:nth-child(3) div.autocomplete__container > button')
    }

    selectCurrency (currency) {
        this.currencyFieldForRangeTotal().click()
        this.getAutocompleteItems().each($el => {
            if ($el.text().includes(currency)) {
                cy.wrap($el).click()
            }
        })
        this.currencyFieldForRangeTotal().contains(currency)
    }

    getCreditsForNonPAYG () {
        return cy.get('input[name="creditAmount"]')
    }

    getCreditValueForNonPAYG () {
        return cy.get('div.expert-form__input-wrapper:nth-child(1) > input')
    }

    getTotalValueForNonPAYG () {
        return cy.get('.expert-form__value-wrapper').should('be.visible')
    }

    getClientNameOnContractPage () {
        return cy.get(':nth-child(1) > :nth-child(1) > .row__value').should('be.visible')
    }

    getAtheneumContractPartyOnContractPage () {
        return cy.get('div.col-2:nth-child(1) div.row:nth-child(4) > span.row__value').should('be.visible')
    }

    getSignedByOnContractPage () {
        return cy.get('div.col-2:nth-child(1) div.row:nth-child(5) > span.row__value').should('be.visible')
    }

    getContractCoverrageOnContractPage () {
        return cy.get('div.col-2:nth-child(1) div.row:nth-child(6) > span.row__value').should('be.visible')
    }

    getSpecificProjectOrAccount () {
        return cy.get('div.col-2:nth-child(1) div.row:nth-child(7) > span.row__value').should('be.visible')
    }

    getContractType () {
        return cy.get('div.col-2:nth-child(1) div.row:nth-child(8) > span.row__value').should('be.visible')
    }

    getSignedStatus () {
        return cy.get('div.col-2:nth-child(1) div.row:nth-child(9) > span.row__value').should('be.visible')
    }

    getTotalValue () {
        return cy.get('div.col-2.col-2--padding:nth-child(2) div:nth-child(2) div.row:nth-child(1) > span.row__value').should('be.visible')
    }

    getPriceRange () {
        return cy.get('div.col-2.col-2--padding:nth-child(2) div:nth-child(2) div.row:nth-child(2) > span.row__value')
            .should('be.visible')
    }

    gtProjectNameOnSideBar () {
        return cy.get('h1:nth-child(1) > a:nth-child(1)').should('be.visible')
    }

    getCreatedContractName () {
        return cy.get('h1.contract-heading').should('be.visible')
    }

    getEditIcon () {
        return cy.get(':nth-child(2) > .action > span').should('be.visible')
    }

    getDeleteIcon () {
        return cy.get('li.action > .action > span').should('be.visible')
    }

    getDeleteConfirmation () {
        return cy.get('.swal2-confirm').should('be.visible')
    }

    getMarginPredictionInFeeValue () {
        return cy.get('input[name="marginPredictionInFeeValue"]').should('be.visible')
    }

    getTotalValueForNonPAYGOnContractDetails () {
        return cy.get('div.col-2.col-2--padding:nth-child(2) div:nth-child(2) div.row:nth-child(3) > span.row__value')
            .should('be.visible')
    }

    getEditIconForNonPAYG () {
        return cy.get(':nth-child(3) > .action > span').should('be.visible')
    }

    getExportButton () {
        return cy.get('.icon').last()
    }
}

export default ContractPage

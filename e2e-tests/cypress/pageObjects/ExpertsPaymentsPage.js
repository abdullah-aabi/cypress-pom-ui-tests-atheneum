class ExpertsPaymentsPage {
    getSearchField (searchCriteria) {
        return cy
            .get('.filter-input__with-button input')
            .should('be.visible')
            .type(`${searchCriteria}{enter}`)
    }

    getPaymentsRows () {
        return cy
            .get('tbody > tr')
            .should('be.visible')
    }


    getExpertName () {
        return cy
            .get(':nth-child(2) > span > a')
            .should('be.visible')
    }

    getProjectName () {
        return cy
            .get(':nth-child(3) > span > a')
            .should('be.visible')
    }

    getPaymentCheckBox () {
        return cy
            .get('span > .checkbox__wrapper > .checkbox')
            .should('be.visible')
    }

    getPaymentStatus () {
        return cy
            .get(':nth-child(9) > span')
            .should('be.visible')
    }


    getPaymentStatusAction (statusLabel) {
        return cy
            .get('.payment-status-actions li')
            .contains(statusLabel)
            .should('be.visible')
    }

    getPaymentStatusApplyButton () {
        return cy
            .get('button.button--primary')
            .contains('Apply')
            .should('be.visible')
    }
}

export default ExpertsPaymentsPage

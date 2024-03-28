class BundleCreationPage {

    getCostValue() {
        return cy.get('input[name="costValue"]').scrollIntoView().should('be.visible')
    }
}

export default BundleCreationPage

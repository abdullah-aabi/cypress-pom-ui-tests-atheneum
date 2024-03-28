class ClientCreateProjectPage {

    getBody() {
        return cy.get('body')
    }

    getCreateProject() {
        return cy.get('.sections-two__link').contains('Create a new project')
    }

    getEnterProjectName() {
        return cy.get('input[type="text"]')
    }

    getProjectType(dataValue) {
        cy.get('[aria-haspopup="listbox"]').click()
        cy.get(`[data-value="${dataValue}"]`).click()
    }

    getProjectBrief(projectBrief) {
        cy.get('[placeholder="Brief placeholder"]').click().type(projectBrief)

    }

    getIndustry(industry) {
        cy.get('[type="text"]').click().type(industry + '{enter}')
    }

    getProjectDetailsCheckBoxByName(labelName) {
        return cy.get('span.MuiFormControlLabel-label').contains(labelName)
    }

    getProjectDetailsSelectByName(labelName) {
        return cy.get('label.MuiFormLabel-root').contains(labelName).parent().find('input')
    }

    getAutocompleteSelection(){
        return cy.get('div.MuiAutocomplete-popper li.MuiAutocomplete-option')
    }

    getPDNameInput() {
        return cy.get('label.MuiFormLabel-root').contains("Project Director").parent().find('input')
    }

    getPDEmailInput() {
        return cy.get('label.MuiFormLabel-root').contains("Email").parent().first().find('input')
    }

    getPDPhoneNumberInput() {
        return cy.get('label.MuiFormLabel-root').contains("Phone").parent().first().find('input')
    }

    getPLNameInput() {
        return cy.get('label.MuiFormLabel-root').contains("Project Lead").parent().find('input')
    }

    getPLEmailInput() {
        return cy.get('label.MuiFormLabel-root:contains("Email")').last().parent().find('input')
    }

    getPLPhoneNumberInput() {
        return cy.get('label.MuiFormLabel-root:contains("Phone")').last().parent().find('input')
    }

    getChargeCodeInput() {
        return cy.get('label.MuiFormLabel-root').contains("Charge code").parent().find('input')
    }

    getCreateScope(scopeName, industry) {
        cy.get('[type="button"]').contains(' Create Scope').click()
        cy.get('[autocomplete="new-field"]').clear().type(scopeName)
        cy.get('[type="text"]').eq(1).click().type(industry + '{enter}')
        cy.get('[title="Enter experts experience level"]').click()
    }

    getAddNewQuestion(question) {
        cy.get('.add-question').contains('Add new question').click()
        cy.get('[autocomplete="new-field"]').type(question)
    }

    getLogoutButton() {
        return cy.get('.header__logout')
    }

    getProjectTitle(projectName) {
        return cy.get('table > tbody > tr').eq(1).find('td').eq(0).contains(projectName).should('be.visible')
    }

    getVerifyProjectBackground(index) {
        return cy.get('.rich-text--light > p').eq(index)
    }

    getVerifyProjectIndustry(index) {
        return cy.get('.rich-text--light > p').eq(index)
    }

    getVerifyProjectType(index) {
        return cy.get('.group > .row > .row__value').eq(index)
    }

    getVerifyInitialScope() {
        cy.get('.Segment > .pull-right').eq(0).find('.segment-edit-icon').eq(4).click()
        return cy.get('[name="name"]')
    }

    getVerifyInitialQuestion() {

        return cy.get('[contenteditable="true"]')
    }

    getCloseSegmentPopup() {
        return cy.get('[id="smallcross"]')
    }

    getVerifyScopeName() {
        return cy.get('.segment--name').eq(1)
    }

    getExitAndDraft(CancelReason) {
        return cy.get('.cancel-wraper > .link ').contains(CancelReason)
    }

    getSeeFilter() {
        return cy.get('div[aria-haspopup="listbox"]').contains('All')
    }

    getFilter(type) {
        return cy.get(`[data-value="${type}"]`)
    }

    getAuditTab () {
        return cy.get('.tab__link').contains('Audit')
    }

    getEngagementManager (index) {
        return cy.get('[name="engagementManager"]').eq(index)
    }

    getEngagementCode () {
        return cy.get('[name="engagementCode"]').eq(0)
    }

    getclientComments () {
        return cy.get('[name="clientComments"]').eq(0)
    }

    getButtonApprove (ButtonName, index) {
        return cy.get('.button').contains(ButtonName).eq(index)
    }
    getButtonNotRelevant (index) {
        return cy.get('.button--red').eq(index)
    }
    getYesButton () {
        return cy.get('[type="button"]').contains('Yes')
    }

    getExpertName () {
        return cy.get('.epl__expert-name')
    }

    getSegmentLink () {
        return cy.get('.project-segment__link')
    }
}
export default ClientCreateProjectPage
class ProjectEmailTrackingPage {

    getExpert() {
        return cy.get('span > a')
    }

    getEmail(Value) {
        return cy.get('.details-list').contains(Value).siblings()
    }

    getReviewConsltation() {
        return cy.get('[title="Review the consultation with Atheneum"]')
    }
}

export default ProjectEmailTrackingPage
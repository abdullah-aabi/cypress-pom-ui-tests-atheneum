import generator from '../../../support/generator'

describe('Creating Mckinsey Project from API', { tags: "mckinsey" }, function () {

    const projectData = {
        project_name: `${generator.generateTestName()} McKinsey project`,
        mckinsey_message_id: `message_${generator.generateTestName()}`
    }

    it('should create a new Mckinsey project of type Expert Sessions', function () {
        cy.postMckinseyProject(projectData)
    })
})

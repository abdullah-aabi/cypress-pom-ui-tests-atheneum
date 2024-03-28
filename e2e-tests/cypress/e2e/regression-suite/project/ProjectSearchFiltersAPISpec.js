const initProjectSearchRequestBody = require('../../../fixtures/objects/projectSearchObject.json')
const projectTypes = require('../../../fixtures/projectTypes.json')
const eplReplyStatuses = require('../../../fixtures/eplReplyStatuses.json')
const eplStatuses = require('../../../fixtures/eplStatuses.json')
const {
  getRandomInt,
  generateTestName
} = require('../../../support/generator')

describe('Account manager searching for projects via API', { tags: "regression" }, function () {
  let testUsers,
    authToken,
    projectsData,
    projectSearchRequestBody,
    staticDataResponse

  const projectName = `${generateTestName()} Expert Sessions project`

  before(function () {
    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers

      cy.createProjectFromAPI(projectName, 'Expert Sessions')

      cy.requestLogIn(
        testUsers.accountManager.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        authToken = loginResponse.body.token
        cy.setLocalStorageLoginInfo(
          loginResponse.body.user,
          loginResponse.body.token
        )

        cy.requestGetStaticData(authToken).then(staticData => {
          staticDataResponse = staticData.body
        })
      })
    })
  })

  beforeEach(function () {
    cy.requestSearchProject(authToken, initProjectSearchRequestBody).then(
      projectSearchResult => {
        const randomProjectIndex = getRandomInt(
          projectSearchResult.body.hits.hits.length
        )
        projectsData = projectSearchResult.body.hits.hits[randomProjectIndex]._source
      }
    )

    projectSearchRequestBody = JSON.parse(
      JSON.stringify(initProjectSearchRequestBody)
    )
  })

  it('should search the project by project name', function () {
    projectSearchRequestBody.keyword = projectsData.name

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).to.eq(1)
        expect(projectSearchResult.body.hits.hits[0]._source.name).to.eq(projectsData.name)
      }
    )
  })

  it('should search the project by project code', function () {
    projectSearchRequestBody.keyword = projectsData.atheneumCode

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
        projectSearchResult.body.hits.hits.forEach(project => {
          expect(project._source.atheneumCode).to.eq(projectsData.atheneumCode)
        })
      }
    )
  })

  it('should search the project by client account', function () {
    projectSearchRequestBody.account = projectsData.account

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
        projectSearchResult.body.hits.hits.forEach(project => {
          expect(project._source.account).to.eq(projectsData.account)
        })
      }
    )
  })

  it('should search the project by atheneum employee', function () {
    projectSearchRequestBody.employee = projectsData.employee[0]

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
        projectSearchResult.body.hits.hits.forEach(project => {
          expect(project._source.employee).to.include(projectsData.employee[0])
        })
      }
    )
  })

  it('should search the project by Only my projects', function () {
    projectSearchRequestBody.onlyMy = true

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
        projectSearchResult.body.hits.hits.forEach(project => {
          expect(project._source.employee).to.include(projectsData.employee[0])
        })
      }
    )
  })

  it('should search the project by Only bookmarked projects', function () {
    projectSearchRequestBody.bookmarked = true

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        if (projectSearchResult.body.hits.hits.length > 0) {
          expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
          projectSearchResult.body.hits.hits.forEach(project => {
            expect(project._source.bookmark.length).greaterThan(0)
          })
        }
      }
    )
  })

  it('should filter the projects by country', function () {
    projectSearchRequestBody.country = [projectsData.country]

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
        projectSearchResult.body.hits.hits.forEach(project => {
          expect(project._source.country).to.eq(projectsData.country)
        })
      }
    )
  })

  it('should filter the projects by Industry', function () {

    projectSearchRequestBody.industry = [projectsData.industry]

    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
        projectSearchResult.body.hits.hits.forEach(project => {
          expect(project._source.industry).to.eq(projectsData.industry)
        })
      }
    )
  })

  projectTypes.forEach(function (projectType) {
    it(`should filter the projects by Project Type = ${projectType}`, function () {
      projectSearchRequestBody.type = projectType

      cy.requestSearchProject(authToken, projectSearchRequestBody).then(
        projectSearchResult => {
          if (projectSearchResult.body.hits.hits.length > 0) {
            expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
            projectSearchResult.body.hits.hits.forEach(project => {
              expect(project._source.type).to.eq(projectType)
            })
          }
        }
      )
    })
  })

  it('should filter the projects by Open status', function () {
    projectSearchRequestBody.statusIds = [1]
    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        if (projectSearchResult.body.hits.hits.length > 0) {
          expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
          projectSearchResult.body.hits.hits.forEach(project => {
            expect(project._source.status).to.eq("Open")
          })
        }
      }
    )
  })

  it('should filter the projects by Pending status', function () {
    projectSearchRequestBody.statusIds = [2]
    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        if (projectSearchResult.body.hits.hits.length > 0) {
          expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
          projectSearchResult.body.hits.hits.forEach(project => {
            expect(project._source.status).to.eq("Pending")
          })
        }
      }
    )
  })

  it('should filter the projects by Closed status', function () {
    projectSearchRequestBody.statusIds = [3]
    cy.requestSearchProject(authToken, projectSearchRequestBody).then(
      projectSearchResult => {
        if (projectSearchResult.body.hits.hits.length > 0) {
          expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
          projectSearchResult.body.hits.hits.forEach(project => {
            expect(project._source.status).to.eq("Closed")
          })
        }
      }
    )
  })

  eplStatuses.forEach(function (eplStatus) {
    it(`should filter the projects by EPL status - ${eplStatus}`, function () {
      const eplStatusId = staticDataResponse.eplStatuses.filter(
        eplS => eplS.name === eplStatus
      )[0].id

      projectSearchRequestBody.eplStatus = [eplStatusId]

      cy.requestSearchProject(authToken, projectSearchRequestBody).then(
        projectSearchResult => {
          if (projectSearchResult.body.hits.hits.length > 0) {
            expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
            projectSearchResult.body.hits.hits.forEach(project => {
              expect(project._source.eplStatus).to.include(eplStatusId)
            })
          }
        }
      )
    })
  })

  eplReplyStatuses.forEach(function (eplReplyStatus) {
    it(`should filter the projects by EPL Reply status - ${eplReplyStatus}`, function () {
      const eplReplyStatusId = staticDataResponse.replyStatuses.filter(
        eplS => eplS.name === eplReplyStatus
      )[0].id

      projectSearchRequestBody.replyStatus = [eplReplyStatusId]

      cy.requestSearchProject(authToken, projectSearchRequestBody).then(
        projectSearchResult => {
          if (projectSearchResult.body.hits.hits.length > 0) {
            expect(projectSearchResult.body.hits.hits.length).greaterThan(0)
            projectSearchResult.body.hits.hits.forEach(project => {
              expect(project._source.replyStatus).to.include(eplReplyStatusId)
            })
          }
        }
      )
    })
  })

  it('should search the project by project name using Search Anything method', function () {
    cy.requestQuickSearch(authToken, projectsData.name).then(searchResults => {
      const project = searchResults.body.filter(projects => projects.name === projectsData.name)[0]
      expect(project.name).to.eq(projectsData.name)
      expect(project.indexType).to.eq('project')
    })

  })
})

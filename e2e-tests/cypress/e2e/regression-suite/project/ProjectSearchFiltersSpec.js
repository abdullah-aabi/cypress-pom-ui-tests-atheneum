import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectSearchPage from '../../../pageObjects/ProjectSearchPage'
const initProjectSearchRequestBody = require('../../../fixtures/objects/projectSearchObject.json')
const projectTypes = require('../../../fixtures/projectTypes.json')
const eplReplyStatuses = require('../../../fixtures/eplReplyStatuses.json')
const eplStatuses = require('../../../fixtures/eplStatuses.json')
const {
  getRandomInt,
  generateTestName
} = require('../../../support/generator')

describe('Account manager searching for projects', { tags: "regression" }, function () {
  let testUsers,
    authToken,
    projectsData,
    staticDataResponse

  const projectName = `${generateTestName()} Expert Sessions project`
  const projectSearchPage = new ProjectSearchPage()
  const globalPage = new GlobalPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
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
        cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/project-search')

        globalPage.expandFilterMenu('Settings')
      })
    })
  })

  beforeEach(function () {
    cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/project`).as('projectSearchRequest')
    cy.intercept('GET', `${Cypress.env('SEARCH_SERVICE_URL')}/menu*`).as('quickSearchCall')

    cy.requestSearchProject(authToken, initProjectSearchRequestBody).then(
      projectSearchResult => {
        const randomProjectIndex = getRandomInt(
          projectSearchResult.body.hits.hits.length
        )
        cy.requestGetProjectById(
          authToken,
          projectSearchResult.body.hits.hits[randomProjectIndex]._source.id
        ).then(projectResponseData => {
          projectsData = projectResponseData.body
        })
      }
    )
    globalPage.getClearSearchButton().click()
  })

  it('should search the project by project name', function () {
    projectSearchPage.getProjectSearchField().type(`${projectName}{enter}`)

    cy.wait('@projectSearchRequest')
  })

  it('should search the project by project code', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.atheneumCode}{enter}`)

    cy.wait('@projectSearchRequest')
  })

  it('should search the project by client account', function () {
    const companyName = projectsData.office.account.companyName
    projectSearchPage.getClientSearchField().type(`${companyName}{enter}`)

    cy.wait('@projectSearchRequest')
  })

  it('should search the project by atheneum employee', function () {
    const atheneumEmployeeName = `${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName
      }`
    projectSearchPage
      .getAtheneumContactSearchField()
      .type(`${atheneumEmployeeName}{enter}`)

    cy.wait('@projectSearchRequest')
  })

  it('should search the project by Only my projects', function () {
    globalPage.clickCheckBoxWrapperByName('Only my projects')

    cy.wait('@projectSearchRequest')
  })

  it('should search the project by Only bookmarked projects', function () {
    globalPage.clickCheckBoxWrapperByName('Only bookmarked projects')

    cy.wait('@projectSearchRequest')
  })

  it('should filter the projects by country', function () {
    const country = staticDataResponse.countries.filter(
      country => country.id === projectsData.office.account.countryId
    )[0].name
    cy.selectFilterByCriteria('Geography', `${country}{enter}`, true)

    cy.wait('@projectSearchRequest')
  })

  it('should filter the projects by Industry', function () {
    const industryName = staticDataResponse.industries.filter(
      industry => industry.id === projectsData.industryId
    )[0].name
    cy.selectFilterByCriteria('Industries', `${industryName}{enter}`)

    cy.wait('@projectSearchRequest')
  })

  projectTypes.forEach(function (projectType) {
    it(`should filter the projects by Project Type = ${projectType}`, function () {
      projectSearchPage.selectProjectTypeFilter(projectType)

      cy.wait('@projectSearchRequest')
    })
  })

  it('should filter the projects by Open status', function () {
    projectSearchPage.getOpenStatusButton().click()

    cy.wait('@projectSearchRequest')
  })

  it('should filter the projects by Pending status', function () {
    projectSearchPage.getPendingStatusButton().click()

    cy.wait('@projectSearchRequest')
  })

  it('should filter the projects by Closed status', function () {
    projectSearchPage.getClosedStatusButton().click()

    cy.wait('@projectSearchRequest')
  })

  eplStatuses.forEach(function (eplStatus) {
    it(`should filter the projects by EPL status - ${eplStatus}`, function () {
      projectSearchPage.selectEPLStatusFilter(eplStatus)

      cy.wait('@projectSearchRequest')
    })
  })

  eplReplyStatuses.forEach(function (eplReplyStatus) {
    it(`should filter the projects by EPL Reply status - ${eplReplyStatus}`, function () {
      projectSearchPage.selectEPLReplyStatusFilter(eplReplyStatus)

      cy.wait('@projectSearchRequest')
    })
  })

  it('should change the page to open project in to Details page', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.projectName}{enter}`)
    projectSearchPage.getProjectResultField().contains(projectsData.projectName)
    projectSearchPage.selectOpenProjectPage('Details')

    projectSearchPage
      .getSearchResultProjectLink()
      .invoke('attr', 'href')
      .should('eq', `/project/${projectsData.id}`)
  })

  it('should change the page to open project in to Experts pipeline page', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.projectName}{enter}`)
    projectSearchPage.getProjectResultField().contains(projectsData.projectName)
    projectSearchPage.selectOpenProjectPage('Experts pipeline')

    projectSearchPage
      .getSearchResultProjectLink()
      .invoke('attr', 'href')
      .should('contain', `/experts-pipeline`)
  })

  it('should change the page to open project in to Client view page', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.projectName}{enter}`)
    projectSearchPage.getProjectResultField().contains(projectsData.projectName)
    projectSearchPage.selectOpenProjectPage('Client view')

    projectSearchPage
      .getSearchResultProjectLink()
      .invoke('attr', 'href')
      .should('contain', `/client-view`)
  })

  it('should change the page to open project in to Outcome page', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.projectName}{enter}`)
    projectSearchPage.getProjectResultField().contains(projectsData.projectName)
    projectSearchPage.selectOpenProjectPage('Outcome')

    projectSearchPage
      .getSearchResultProjectLink()
      .invoke('attr', 'href')
      .should('contain', `/outcome`)
  })

  it('should change the page to open project in to Invoice page', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.projectName}{enter}`)
    projectSearchPage.getProjectResultField().contains(projectsData.projectName)
    projectSearchPage.selectOpenProjectPage('Invoice')

    projectSearchPage
      .getSearchResultProjectLink()
      .invoke('attr', 'href')
      .should('contain', `/invoice`)
  })

  it('should change the page to open project in to Logs page', function () {
    projectSearchPage
      .getProjectSearchField()
      .type(`${projectsData.projectName}{enter}`)
    projectSearchPage.getProjectResultField().contains(projectsData.projectName)
    projectSearchPage.selectOpenProjectPage('Logs')

    projectSearchPage
      .getSearchResultProjectLink()
      .invoke('attr', 'href')
      .should('contain', `/logs`)
  })

  it('should search the project by project name using Search Anything method', function () {
    globalPage.getSearchAnythingInput().type(projectName)
    globalPage.getSearchAnythingResults().should('contain.text', projectName)

    cy.wait("@quickSearchCall")
  })
})

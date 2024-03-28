import GlobalPage from '../../../pageObjects/GlobalPage'
import ClientViewPage from '../../../pageObjects/ClientViewPage'
import ExpertPipelinPage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'

describe('Associate Changing the expert pipeline status and verify', { tags: "regression" }, function () {
  let testData, authToken, userDetails, projectId
  let createdExperts = []
  let expertNamesData = []

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const globalPage = new GlobalPage()
  const expertPipelinePage = new ExpertPipelinPage()
  const clientViewPage = new ClientViewPage()

  const generateExpertNames = () => {
    for (let i = 0; i <= 1; i++) {
      const firstName = generator.generateFirstName()
      const lastName = generator.generateLastName()

      expertNamesData.push({
        firstName: firstName,
        lastName: lastName,
        originalName: `${firstName} ${lastName}`,
        email: `${firstName + lastName}@mail.com`
      })
    }
  }

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    generateExpertNames()

    cy.clearLocalAndSessionStorage()
    cy.fixture('expertDetails').then(testdata => {
      testData = testdata
    })
    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id

        cy.fixture('testUsers').then(testUsers => {
          userDetails = testUsers.accountManager

          cy.requestLogIn(
            userDetails.emailAddress,
            Cypress.env('CYPRESS_USER_PASSWORD')
          ).then(loginResponse => {
            authToken = loginResponse.body
          })
        })

        cy.wrap(expertNamesData).each(expert => {
          cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = expert.firstName
            expertCreateObject.lastName = expert.lastName
            expertCreateObject.originalName = expert.originalName
            expertCreateObject.email = expert.email
            cy.requestCreateExpert(authToken.token, expertCreateObject).then(
              expertCreateResponse => {
                createdExperts.push(expertCreateResponse.body)
                cy.addAndInviteExpertToProjectFromAPI(projectId, expertCreateResponse.body.id)
              }
            )
          })
        })
      })
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(authToken.user, authToken.token)
    cy.intercept('POST', `**/api/project/${projectId}/pipeline`).as('projectPipelineRequest')
    cy.intercept('GET', `**/api/expert-project-link/**`).as('projectPipelineGetRequest')
    cy.visit(
      `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/experts-pipeline`
    )
    cy.wait('@projectPipelineRequest').its('response.statusCode').should('eq', 200)
    cy.wait(500)
  })

  it('should verify that expert is visible in Client view tab if status is more than Submitted', function () {
    cy.changeEPLStatus(createdExperts[0].originalName, 'Submitted')
    expertPipelinePage.getEplStatusConfirmButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'EPL successfully updated.')
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('have.text', createdExperts[0].originalName)
    clientViewPage.getExpertPosition(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.expandExpertProfile(createdExperts[0].originalName)
    clientViewPage.getProfilePopupExpertPosition().should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getProfilePopupExpertCompanyAndDuration().should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.getProfilePopupScreening().should('have.text', testData.expertScreeningInfo)
    clientViewPage.getProfilePopupAvailability().should('have.text', testData.expertAvailability)

    clientViewPage.getProfilePopupLanguageName().should('have.text', createdExperts[0].languages[0].name)

    clientViewPage.getProfilePopupPositions().should('have.length', createdExperts[0].cv.experiences.length)

    clientViewPage.getProfilePopupIndustryExperience().should('have.text', createdExperts[0].expert.industryExpertise.replace('<p>', '').replace('</p>', ''))
  })

  it('should verify that expert is not visible in Client view tab if status is less than Submitted', function () {
    cy.checkEPLStatus(createdExperts[1].originalName, 'Recruitment')
    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('not.have.text', createdExperts[1].originalName)
  })

  it('should verify that expert Screening is hidden in Client view tab', function () {
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideScreening().click()
    expertPipelinePage.getEplPopupSave().click()

    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)
    clientViewPage.getExpertPosition(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.expandExpertProfile(createdExperts[0].originalName)
    clientViewPage.getProfilePopupExpertPosition().should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getProfilePopupExpertCompanyAndDuration().should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.getProfilePopupHeaders().should('not.contain', 'Screening')

    clientViewPage.getProfilePopupLanguageName().should('have.text', createdExperts[0].languages[0].name)

    clientViewPage.getProfilePopupPositions().should('have.length', createdExperts[0].cv.experiences.length)

    clientViewPage.getProfilePopupIndustryExperience().should('have.text', createdExperts[0].expert.industryExpertise.replace('<p>', '').replace('</p>', ''))
  })

  it('should verify that expert Availability is hidden in Client view tab', function () {
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideAvailability().click()
    expertPipelinePage.getEplPopupSave().click()

    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)
    clientViewPage.getExpertPosition(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.expandExpertProfile(createdExperts[0].originalName)

    clientViewPage.getProfilePopupAvailability().should('have.text', 'Upon request')
  })

  it('should verify that expert Industry experience (relevance statement) is hidden in Client view tab', function () {
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideIndustryExpertise().click()
    expertPipelinePage.getEplPopupSave().click()

    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)
    clientViewPage.getExpertPosition(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.expandExpertProfile(createdExperts[0].originalName)

    clientViewPage.getProfilePopupHeaders().should('not.contain', 'Relevance Statement')
  })

  it('should verify that expert Language is hidden in Client view tab', function () {
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideLanguage().click()
    expertPipelinePage.getEplPopupSave().click()

    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)
    clientViewPage.getExpertPosition(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].position.name)
    clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('contain.text', createdExperts[0].cv.experiences[0].company.name)

    clientViewPage.expandExpertProfile(createdExperts[0].originalName)

    clientViewPage.getProfilePopupLanguageName().should('not.exist')
  })

  it('should verify that expert Experience - position is hidden in Client view tab', function () {
    let positionInterval
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHidePosition().first().click()
    expertPipelinePage.getEPLPopupHideCompanyName().first().next().then(element => {
      positionInterval = element.text()

      expertPipelinePage.getEplPopupSave().click()

      clientViewPage
        .getClientViewLinkButton()
        .scrollIntoView()
        .click()

      clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)
      clientViewPage.getExpertPosition(createdExperts[0].originalName).should('not.contain', createdExperts[0].cv.experiences[0].position.name)
      clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('have.text', `${createdExperts[0].cv.experiences[0].company.name} ${positionInterval}`)

      clientViewPage.expandExpertProfile(createdExperts[0].originalName)

      clientViewPage.getProfilePopupExpertPosition().should('not.contain', createdExperts[0].cv.experiences[0].position.name)
      clientViewPage.getProfilePopupPositions().first().should('not.contain', createdExperts[0].cv.experiences[0].position.name)
    })
  })

  it('should verify that expert Experience - company name is hidden in Client view tab', function () {
    let positionInterval
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideCompanyName().first().click()
    expertPipelinePage.getEPLPopupHideCompanyName().first().next().then(element => {
      positionInterval = element.text()

      expertPipelinePage.getEplPopupSave().click()

      clientViewPage
        .getClientViewLinkButton()
        .scrollIntoView()
        .click()

      clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)
      clientViewPage.getExpertPosition(createdExperts[0].originalName).should('not.contain', createdExperts[0].cv.experiences[0].position.name)
      clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('have.text', `Unknown company ${positionInterval}`)

      clientViewPage.expandExpertProfile(createdExperts[0].originalName)

      clientViewPage.getProfilePopupExpertPosition().should('not.contain', createdExperts[0].cv.experiences[0].position.name)
      clientViewPage.getProfilePopupPositions().first().should('have.text', `Unknown company, ${positionInterval}`)
    })
  })

  it('should verify that expert Experience - date is hidden in Client view tab', function () {
    let positionInterval
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideDate().first().click()
    expertPipelinePage.getEPLPopupHideCompanyName().first().next().then(element => {
      positionInterval = element.text()

      expertPipelinePage.getEplPopupSave().click()

      clientViewPage
        .getClientViewLinkButton()
        .scrollIntoView()
        .click()

      clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)

      clientViewPage.getExpertCompanyAndExperience(createdExperts[0].originalName).should('not.contain', positionInterval)

      clientViewPage.expandExpertProfile(createdExperts[0].originalName)

      clientViewPage.getProfilePopupExpertPosition().should('not.contain', createdExperts[0].cv.experiences[0].position.name)
      clientViewPage.getProfilePopupPositions().first().should('not.contain', positionInterval)
    })
  })

  it('should verify that expert Experience is hidden in Client view tab', function () {
    cy.checkEPLStatus(createdExperts[0].originalName, 'Submitted')
    cy.verifyEplSubmitColor(createdExperts[0].originalName, 'rgb(58, 134, 191)')
    expertPipelinePage.getEplByExpertName(createdExperts[0].originalName).click({ force: true })
    cy.wait('@projectPipelineGetRequest').its('response.statusCode').should('eq', 200)
    expertPipelinePage.getEPLPopupHideExperience().first().click()
    expertPipelinePage.getEplPopupSave().click()

    clientViewPage
      .getClientViewLinkButton()
      .scrollIntoView()
      .click()

    clientViewPage.getEplExpertName().should('contain.text', createdExperts[0].originalName)

    clientViewPage.expandExpertProfile(createdExperts[0].originalName)

    clientViewPage.getProfilePopupPositions().should('have.length', 2)
    clientViewPage.getProfilePopupPositions().should('not.contain', createdExperts[0].cv.experiences[1].position.name)
    clientViewPage.getProfilePopupPositions().should('not.contain', createdExperts[0].cv.experiences[1].company.name)
  })
})

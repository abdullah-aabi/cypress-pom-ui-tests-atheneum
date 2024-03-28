import ProjectSearchPage from '../../../pageObjects/ProjectSearchPage'
import ProjectCreationPage from '../../../pageObjects/ProjectCreationPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import ProjectDetailsPage from '../../../pageObjects/ProjectDetailsPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import ExpertPipelinePage from '../../../pageObjects/ExpertPipelinePage'
import generator from '../../../support/generator'

describe('Creating Client Project by Team Leader', { tags: "regression" }, function () {
  let projectDetails,
    authToken,
    testData,
    userDetails,
    prefferedLanguageFirst,
    prefferedLanguageSecond,
    projectName,
    projectType,
    projectIndustry,
    projectSubIndustry,
    staticData,
    projectId,
    expertFullName
  const globalPage = new GlobalPage()
  const projectCreationPage = new ProjectCreationPage()
  const projectSearchPage = new ProjectSearchPage()
  const projectDetailsPage = new ProjectDetailsPage()
  const expertInvitePage = new ExpertInvitePage()
  const expertPipelinePage = new ExpertPipelinePage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
    cy.fixture('testUsers').then(testUsers => {
      userDetails = testUsers.teamLeader
      expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName}`
      cy.requestLogIn(
        userDetails.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        authToken = loginResponse

        cy.fixture('testData').then(testdata => {
          testData = testdata
        })

        cy.fixture('projectDetails').then(testData => {
          projectDetails = testData
        })

        cy.requestGetStaticData(loginResponse.body.token).then(
          staticDataResponse => {
            staticData = staticDataResponse.body
          }
        )
      })
    })
  })

  beforeEach(function () {
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project`).as('createProject')

    prefferedLanguageFirst =
      staticData.languages[generator.getRandomInt(staticData.languages.length)]
        .name
    prefferedLanguageSecond =
      staticData.languages[generator.getRandomInt(staticData.languages.length)]
        .name

    projectSubIndustry = (
      staticData.subIndustries[
        generator.getRandomInt(staticData.subIndustries.length)
      ].name === 'Other') ? staticData.subIndustries[1] : staticData.subIndustries[
    generator.getRandomInt(staticData.subIndustries.length)
    ]

    projectIndustry = staticData.industries.filter(
      industry => industry.id === projectSubIndustry.industryId
    )[0]

    cy.setLocalStorageLoginInfo(authToken.body.user, authToken.body.token)
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project-search`)
    cy.waitForLoadingDisappear()

    projectSearchPage.getCreateProjectButton().click()
  })

  it('should create a new Project of type Expert Sessions with screening questions', { tags: "smoke" }, function () {
    projectType = 'Expert Sessions'
    projectName = `${generator.generateTestName()} ${projectType} project`

    projectCreationPage.selectClientOfficeField(testData.officeName)
    projectCreationPage
      .getClientAccountField()
      .should('have.attr', 'value', testData.accountName)

    projectCreationPage.selectClientContactName(testData.clientContactName)

    projectCreationPage
      .getClientAvailabiliesField()
      .type(projectDetails.clientAvailability)

    projectCreationPage.selectClientPrefferedLanguage(prefferedLanguageFirst)
    projectCreationPage.selectClientPrefferedLanguage(prefferedLanguageSecond)

    projectCreationPage.getProjectNameField().type(projectName)

    projectCreationPage.selectAtheneumContactField(
      `${userDetails.firstName} ${userDetails.lastName}`
    )
    projectCreationPage.selectProjectManagerId('Test Associate')

    projectCreationPage.selectProjectCategory('Due Diligence')

    projectCreationPage.selectIndustryField(projectSubIndustry.name)

    projectCreationPage.selectProjectType(projectType)

    projectCreationPage.getBackgroundField().type(projectDetails.background)

    projectCreationPage
      .getBlacklistedCompaniesField()
      .type(projectDetails.blacklistedCompanies)

    projectCreationPage
      .getTargetNoOfInterviewsField()
      .type(projectDetails.targetNoOfInterviews)
    projectCreationPage.getSegmentTitleField().type(projectDetails.segmentTitle)
    projectCreationPage
      .getNoOfExpertsRequiredField()
      .type(projectDetails.noOfExperts)

    projectCreationPage
      .getInvoicingInstructionsField()
      .type(projectDetails.invoicingInstructions)
    projectCreationPage.getExpertBriefField().type(projectDetails.expertBrief, { force: true })
    projectCreationPage.getProjectSaveButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'Project created successfully')
    globalPage
      .getNotificationMessage()
      .last()
      .should(
        'have.text',
        `You have been assigned to project ${projectName} by ${userDetails.firstName
        } ${userDetails.lastName}`
      )

    projectDetailsPage.getProjectName().should('have.text', projectName)
    projectDetailsPage
      .getClientContact()
      .should('contain.text', testData.clientContactName)
    projectDetailsPage
      .getAtheneumContact()
      .should('have.text', `${userDetails.firstName} ${userDetails.lastName}`)

    projectDetailsPage.getProjectCategory().should('have.text', 'Due Diligence')

    projectDetailsPage.getProjectManager().should('contain.text', 'Test Associate')
    projectDetailsPage.getProjectDetailsRowValueByName('Type').should('have.text', projectType)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Client account')
      .should('have.text', testData.accountName)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Industry and subindustry')
      .should(
        'have.text',
        `${projectIndustry.name} / ${projectSubIndustry.name}`
      )
    projectDetailsPage.getProjectStatus().should('have.text', 'Open')

    projectDetailsPage
      .getProjectBackground()
      .should('contain.text', projectDetails.background)
    projectDetailsPage
      .getBlacklistedCompanies()
      .should('have.text', projectDetails.blacklistedCompanies)
    projectDetailsPage
      .getInvoicingInstructions()
      .should('have.text', projectDetails.invoicingInstructions)
    projectDetailsPage
      .getClientAvailabilities()
      .should('have.text', projectDetails.clientAvailability)
    projectDetailsPage
      .getClientPrefferedLanguages()
      .should(
        'have.text',
        `${prefferedLanguageFirst}, ${prefferedLanguageSecond}`
      )
  })

  it('should create a new Project of type Expert-backed Research', function () {
    projectType = 'Expert-backed Research'
    projectName = `${generator.generateTestName()} ${projectType} project`

    projectCreationPage.selectClientOfficeField(testData.officeName)
    projectCreationPage
      .getClientAccountField()
      .should('have.attr', 'value', testData.accountName)

    projectCreationPage.selectClientContactName(testData.clientContactName)

    projectCreationPage.getProjectNameField().type(projectName)

    projectCreationPage.selectAtheneumContactField(
      `${userDetails.firstName} ${userDetails.lastName}`
    )
    projectCreationPage.selectProjectManagerId('Test Associate')

    projectCreationPage.selectProjectCategory('Strategy/Market Entry')

    projectCreationPage.selectIndustryField(projectSubIndustry.name)
    projectCreationPage.selectProjectType(projectType)

    projectCreationPage.getBackgroundField().type(projectDetails.background)
    projectCreationPage
      .getTargetNoOfInterviewsField()
      .type(projectDetails.targetNoOfInterviews)
    projectCreationPage.getSegmentTitleField().type(projectDetails.segmentTitle)
    projectCreationPage
      .getNoOfExpertsRequiredField()
      .type(projectDetails.noOfExperts)
    projectCreationPage.getExpertBriefField().type(projectDetails.expertBrief)
    projectCreationPage.getProjectSaveButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'Project created successfully')
    globalPage
      .getNotificationMessage()
      .last()
      .should(
        'have.text',
        `You have been assigned to project ${projectName} by ${userDetails.firstName
        } ${userDetails.lastName}`
      )

    projectDetailsPage.getProjectName().should('have.text', projectName)
    projectDetailsPage.getProjectDetailsRowValueByName('Type').should('have.text', projectType)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Client account')
      .should('have.text', testData.accountName)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Industry and subindustry')
      .should(
        'have.text',
        `${projectIndustry.name} / ${projectSubIndustry.name}`
      )
    projectDetailsPage.getProjectManager().should('contain.text', 'Test Associate')
  })

  it('should create a new Project of type Expert Placement', function () {
    projectType = 'Expert Placement'
    projectName = `${generator.generateTestName()} ${projectType} project`

    projectCreationPage.selectClientOfficeField(testData.officeName)
    projectCreationPage
      .getClientAccountField()
      .should('have.attr', 'value', testData.accountName)

    projectCreationPage.selectClientContactName(testData.clientContactName)

    projectCreationPage.getProjectNameField().type(projectName)

    projectCreationPage.selectAtheneumContactField(
      `${userDetails.firstName} ${userDetails.lastName}`
    )
    projectCreationPage.selectProjectManagerId('Test Associate')

    projectCreationPage.selectProjectCategory('Healthcare')

    projectCreationPage.selectIndustryField(projectSubIndustry.name)
    projectCreationPage.selectProjectType(projectType)

    projectCreationPage.getBackgroundField().type(projectDetails.background)
    projectCreationPage
      .getTargetNoOfInterviewsField()
      .type(projectDetails.targetNoOfInterviews)
    projectCreationPage.getSegmentTitleField().type(projectDetails.segmentTitle)
    projectCreationPage
      .getNoOfExpertsRequiredField()
      .type(projectDetails.noOfExperts)
    projectCreationPage.getExpertBriefField().type(projectDetails.expertBrief)
    projectCreationPage.getProjectSaveButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'Project created successfully')
    globalPage
      .getNotificationMessage()
      .last()
      .should(
        'have.text',
        `You have been assigned to project ${projectName} by ${userDetails.firstName
        } ${userDetails.lastName}`
      )

    projectDetailsPage.getProjectName().should('have.text', projectName)
    projectDetailsPage.getProjectDetailsRowValueByName('Type').should('have.text', projectType)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Client account')
      .should('have.text', testData.accountName)
    projectDetailsPage.getProjectManager().should('contain.text', 'Test Associate')
    projectDetailsPage
      .getProjectDetailsRowValueByName('Industry and subindustry')
      .should(
        'have.text',
        `${projectIndustry.name} / ${projectSubIndustry.name}`
      )
  })

  it('should create a new Project of type Expert Survey Research', function () {
    projectType = 'Expert Survey Research'
    projectName = `${generator.generateTestName()} ${projectType} project`

    projectCreationPage.selectClientOfficeField(testData.officeName)
    projectCreationPage
      .getClientAccountField()
      .should('have.attr', 'value', testData.accountName)

    projectCreationPage.selectClientContactName(testData.clientContactName)

    projectCreationPage.getProjectNameField().type(projectName)

    projectCreationPage.selectAtheneumContactField(
      `${userDetails.firstName} ${userDetails.lastName}`
    )
    projectCreationPage.selectProjectManagerId('Test Associate')

    projectCreationPage.selectProjectCategory('Proposal')
    projectCreationPage.selectIndustryField(projectSubIndustry.name)
    projectCreationPage.selectProjectType(projectType)

    projectCreationPage.getBackgroundField().type(projectDetails.background)
    projectCreationPage
      .getTargetNoOfInterviewsField()
      .type(projectDetails.targetNoOfInterviews)
    projectCreationPage.getSegmentTitleField().type(projectDetails.segmentTitle)
    projectCreationPage
      .getNoOfExpertsRequiredField()
      .type(projectDetails.noOfExperts)
    projectCreationPage.getExpertBriefField().type(projectDetails.expertBrief)
    projectCreationPage.getProjectSaveButton().click()

    globalPage.getNotificationTitle().should('have.text', 'Success!')
    globalPage
      .getNotificationMessage()
      .first()
      .should('have.text', 'Project created successfully')
    globalPage
      .getNotificationMessage()
      .last()
      .should(
        'have.text',
        `You have been assigned to project ${projectName} by ${userDetails.firstName
        } ${userDetails.lastName}`
      )

    projectDetailsPage.getProjectName().should('have.text', projectName)
    projectDetailsPage.getProjectDetailsRowValueByName('Type').should('have.text', projectType)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Client account')
      .should('have.text', testData.accountName)
    projectDetailsPage
      .getProjectDetailsRowValueByName('Industry and subindustry')
      .should(
        'have.text',
        `${projectIndustry.name} / ${projectSubIndustry.name}`
      )
    projectDetailsPage.getProjectManager().should('contain.text', 'Test Associate')
  })

  it('should create a new Project of type Expert Sessions and add additional questions to segment', function () {
    projectName = `${generator.generateTestName()} Expert Sessions project`

    projectCreationPage.selectClientOfficeField(testData.officeName)
    projectCreationPage
      .getClientAccountField()
      .should('have.attr', 'value', testData.accountName)

    projectCreationPage.selectClientContactName(testData.clientContactName)

    projectCreationPage.getProjectNameField().type(projectName)

    projectCreationPage.selectAtheneumContactField(
      `${userDetails.firstName} ${userDetails.lastName}`
    )
    projectCreationPage.selectProjectCategory('Proposal')
    projectCreationPage.selectProjectManagerId('Test Associate')

    projectCreationPage.selectIndustryField(projectDetails.subIndustry)

    projectCreationPage.getBackgroundField().type(projectDetails.background)
    projectCreationPage
      .getTargetNoOfInterviewsField()
      .type(projectDetails.targetNoOfInterviews)
    projectCreationPage.getSegmentTitleField().type(projectDetails.segmentTitle)
    projectCreationPage
      .getNoOfExpertsRequiredField()
      .type(projectDetails.noOfExperts)
    projectCreationPage.getExpertBriefField().type(projectDetails.expertBrief)
    projectCreationPage.getProjectSaveButton().click()


    cy.wait('@createProject').its('response').then(createProject => {
      projectId = createProject.body.id

      globalPage.getNotificationTitle().should('have.text', 'Success!')
      globalPage
        .getNotificationMessage()
        .first()
        .should('have.text', 'Project created successfully')
      globalPage
        .getNotificationMessage()
        .last()
        .should(
          'have.text',
          `You have been assigned to project ${projectName} by ${userDetails.firstName
          } ${userDetails.lastName}`
        )

      projectDetailsPage.getEditSegmentButton().click()
      projectDetailsPage.getScreeningQuestionsAddButton().click()
      projectDetailsPage
        .getScreeningTextAreaList()
        .last()
        .type(projectDetails.screeningQuestion1)
      projectDetailsPage.getScreeningQuestionsAddButton().click()
      projectDetailsPage
        .getScreeningTextAreaList()
        .last()
        .type(projectDetails.screeningQuestion2)
      projectDetailsPage.getEditSegmentFormSaveButton().click()

      projectDetailsPage
        .getProjectStoryDetailsList()
        .first()
        .contains(projectDetails.background)
      projectDetailsPage
        .getAtheneumContactsLabel()
        .contains(`${userDetails.firstName} ${userDetails.lastName}`)
      projectDetailsPage.getProjectCategory().should('have.text', 'Proposal')

      projectDetailsPage.getProjectSegments().contains(projectDetails.noOfExperts)
      projectDetailsPage
        .getProjectSegments()
        .contains(projectDetails.segmentTitle)
      projectDetailsPage.getEditSegmentButton().click()
      projectDetailsPage
        .getScreeningTextAreaList()
        .contains(projectDetails.screeningQuestion1)
      projectDetailsPage
        .getScreeningTextAreaList()
        .last()
        .contains(projectDetails.screeningQuestion2)
      projectDetailsPage.getEditSegmentFormCancelButton().click()

      cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)
      expertInvitePage.getExpertsPipelineButton().click()
      cy.clickEplExpertToExpand(expertFullName)
      expertPipelinePage.selectFeeCurrencyByValue(projectDetails.feeCurrency)
      cy.verifyNotificationAndClose()
      expertPipelinePage.getFeeAmountField().type(projectDetails.feeAmountField)
      expertPipelinePage
        .getIconForFeeDescription()
        .should('be.visible')
        .click()
      cy.verifyNotificationAndClose()
      cy.changeEPLStatus(expertFullName, 'Submitted')
      expertPipelinePage.getEplStatusConfirmButton().click()
      cy.checkEPLStatus(expertFullName, 'Submitted')
      expertInvitePage.getDetailsButton(projectId).click()
      projectDetailsPage.getProjectCategory().should('have.text', 'Proposal')

    })
  })
})
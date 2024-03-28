import generator from '../../../support/generator'
import EPLDetailsPage from '../../../pageObjects/EPLDetailsPage'

describe('Expert Project Invitation Tests', { tags: "regression" }, function () {
  let projectId, testUsers, authToken, localStorage, projectDetails
  let createdExperts = []
  let expertData = generator.generateExpertNames(2)
  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const eplDetailsPage = new EPLDetailsPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()

    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers

      cy.requestLogIn(
        testUsers.erm.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(quickLoginResponse => {
        authToken = quickLoginResponse.body.token
        localStorage = quickLoginResponse.body

        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
      })
    })

    cy.fixture('projectDetails').then(projectdetails => {
      projectDetails = projectdetails
    })

    cy.wrap(expertData).each(expert => {
      cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
        expertCreateObject.firstName = expert.firstName
        expertCreateObject.lastName = expert.lastName
        expertCreateObject.originalName = expert.originalName
        expertCreateObject.email = expert.email
        cy.requestCreateExpert(authToken, expertCreateObject).then(
          expertCreateResponse =>
            createdExperts.push({
              expertId: expertCreateResponse.body.id,
              fullName: expertCreateObject.originalName
            })
        )
      })
    })

    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id

        createdExperts.forEach(expert => {
          cy.addAndInviteExpertIdToProjectFromAPI(
            projectId,
            expert.expertId
          )
        })
      }
    )
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.visit(
      `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/project/${projectId}/experts-pipeline`
    )
    cy.intercept('POST', '**/api/expert-project-link/margin').as('waitForMargin')
  })

  it('should change the reply status to Applied when the expert Accepts the project invitation', function () {
    cy.checkEPLStatus(createdExperts[0].fullName, 'Recruitment')
    cy.verifyExpertReplyStatus(createdExperts[0].fullName, 'Invited')
    cy.requestLoginAsExpertById(createdExperts[0].expertId).then(
      expertQuickLoginResponse => {
        cy.requestGetExpertAvailableConsultations(
          expertQuickLoginResponse.body.token,
          expertQuickLoginResponse.body.user.id
        ).then(availableConsultationsResponse => {
          cy.requestExpertGetProjectLink(
            expertQuickLoginResponse.body.token,
            availableConsultationsResponse.body[0].id
          ).then(eplDataResponse => {
            const eplApplyRequestBody = {
              screeningQuestions: [],
              expertSchedulingRequest: '<p>Accepted</p>',
              phoneTypeId: 1,
              phoneNum: '2222'
            }
            eplDataResponse.body.screeningQuestions.forEach(projectQuestion => {
              eplApplyRequestBody.screeningQuestions.push({
                question: projectQuestion.question,
                answer: '<p>test</p>'
              })
            })

            cy.requestExpertProjectLinkApply(
              expertQuickLoginResponse.body.token,
              availableConsultationsResponse.body[0].id,
              eplApplyRequestBody
            )
          })
        })
      }
    )

    cy.reload()
    cy.verifyExpertReplyStatus(createdExperts[0].fullName, 'Applied')
    eplDetailsPage.getExpertName().first().click()
    cy.wait('@waitForMargin').its('response.statusCode').should('eq', 200)
    eplDetailsPage.getScreeningQueAns(1, 1).should('have.text', projectDetails.screeningDefaultQuestion)
    eplDetailsPage.getScreeningQueAns(1, 2).should('have.text', 'test')
    eplDetailsPage.getScreeningQueAns(2, 1).should('have.text', projectDetails.screeningQuestion1)
    eplDetailsPage.getScreeningQueAns(2, 2).should('have.text', 'test')
    eplDetailsPage.getScreeningQueAns(3, 1).should('have.text', projectDetails.screeningQuestion2)
    eplDetailsPage.getScreeningQueAns(3, 2).should('have.text', 'test')
    eplDetailsPage.getScheduleTime().should('have.text', 'Accepted')
  })

  it('should change EPL status to Not Interested when the expert Denies the project invitation', function () {
    cy.checkEPLStatus(createdExperts[1].fullName, 'Recruitment')
    cy.verifyExpertReplyStatus(createdExperts[1].fullName, 'Invited')
    cy.requestLoginAsExpertById(createdExperts[1].expertId).then(
      expertQuickLoginResponse => {
        cy.requestGetExpertAvailableConsultations(
          expertQuickLoginResponse.body.token,
          expertQuickLoginResponse.body.user.id
        ).then(availableConsultationsResponse => {
          cy.fixture('objects/expertDeclineProjectObject').then(
            expertDeclineProjectObject => {
              cy.requestExpertDeclineApplication(
                expertQuickLoginResponse.body.token,
                availableConsultationsResponse.body[0].id,
                expertDeclineProjectObject
              )
            }
          )
        })
      }
    )

    cy.reload()
    cy.verifyExpertReplyStatus(createdExperts[1].fullName, 'Not interested')
  })
})

/// <reference types="Cypress" />
import generator from '../../../support/generator'
import EmailTrackingPage from '../../../pageObjects/EmailTrackingPage'
import ProjectEmailTrackingPage from '../../../pageObjects/ProjectEmailTrackingPage';
import moment from 'moment';

describe('Email Tracking', { tags: "regression" }, function () {
  let testUsers,
    employeeFullName,
    expertFullName,
    projectId,
    localStorage

  const projectName = `${generator.generateTestName()} Expert Sessions project`
  const emailTrackingPage = new EmailTrackingPage()
  const projectEmailTrackingPage = new ProjectEmailTrackingPage()

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers

      expertFullName = `${testUsers.expert.firstName} ${testUsers.expert.lastName}`
      employeeFullName = `${testUsers.accountManager.firstName} ${testUsers.accountManager.lastName}`

    })
    cy.createProjectFromAPI(projectName, 'Expert Sessions').then(
      projectCreateResponse => {
        projectId = projectCreateResponse.body.id
        cy.addAndInviteExpertToProjectFromAPI(projectId, expertFullName)

        cy.requestLogIn(
          testUsers.accountManager.emailAddress,
          Cypress.env('CYPRESS_USER_PASSWORD')
        ).then(quickLoginResponse => {
          localStorage = quickLoginResponse.body
          cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)

          cy.visit(
            `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/project/${projectId}/email-tracking`
          )
        })

      }
    )
  })

  it('should Verify Email Tracking', function () {
    emailTrackingPage.getRecipients().should('have.text', '1')
    emailTrackingPage.getSent(0).should('have.text', '1')
    emailTrackingPage.getSent(1).should('have.text', '1')
  })

  it('should Verify Content of Email', function () {
    emailTrackingPage.getSeeEmails().click()
    projectEmailTrackingPage.getExpert().should('have.text', expertFullName)
    projectEmailTrackingPage.getEmail('To').then(EmailTo => {
      expect(EmailTo.text()).to.eql(testUsers.expert.emailAddress)
    })
    projectEmailTrackingPage.getEmail('From').then(EmailFrom => {
      expect(EmailFrom.text()).to.eql(testUsers.accountManager.emailAddress)
    })
    projectEmailTrackingPage.getEmail('Subject').then(Subject => {
      expect(Subject.text()).to.includes("Atheneum Consultation Opportunity - " + projectName)
    })
    projectEmailTrackingPage.getEmail('Employee').then(Employee => {
      expect(Employee.text()).to.includes(employeeFullName)
    })
    const Date = moment().format('M/DD/YYYY');
    const DateFormat = moment(Date).format('MMM DD, Y')

    projectEmailTrackingPage.getEmail('Sent').then(SentDate => {
      const dateSplit = SentDate.text().split('at')
      expect(dateSplit[0]).to.includes(DateFormat)
    })

    projectEmailTrackingPage.getReviewConsltation().then(link => {
      expect(link.text()).to.eql('Review the consultation with Atheneum')
    })
  })
})

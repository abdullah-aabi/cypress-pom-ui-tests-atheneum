import generator from '../../../support/generator'
import ExpertSearchPage from '../../../pageObjects/ExpertSearchPage'
import GlobalPage from '../../../pageObjects/GlobalPage'
import AthenaListsPage from '../../../pageObjects/AthenaListsPage'
import ExpertInvitePage from '../../../pageObjects/ExpertInvitePage'
import { recurse } from 'cypress-recurse'
import ExpertDetailsPage from '../../../pageObjects/ExpertDetailsPage'


describe('Fill Athena list from Expert-Search', { tags: "regression" }, function () {
  let testUsers, authToken, localStorage, projectDetails, ESListId, employeeFullName, manualListId
  let expertNamesData = []
  let createdExperts = []

  const expertSearchPage = new ExpertSearchPage()
  const globalPage = new GlobalPage()
  const athenaListsPage = new AthenaListsPage()
  const expertInvitePage = new ExpertInvitePage()
  const expertDetailsPage = new ExpertDetailsPage()
  const projectName = `${generator.generateTestName()} Expert Sessions project`

  const generateExpertNames = () => {
    const firstName = generator.generateFirstName()
    const lastName = generator.generateLastName()
    expertNamesData.push({
      firstName: firstName,
      lastName: lastName,
      originalName: `${firstName} ${lastName}`,
      email: `${firstName + lastName}@mail.com`
    })
  }

  before(function () {
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/logged-out`)
    cy.clearLocalAndSessionStorage()
    generateExpertNames()

    cy.fixture('testUsers').then(testusers => {
      testUsers = testusers
      employeeFullName = `${testUsers.teamLeader.firstName} ${testUsers.teamLeader.lastName
        }`
      cy.requestLogIn(
        testUsers.teamLeader.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(quickLoginResponse => {
        authToken = quickLoginResponse.body.token
        localStorage = quickLoginResponse.body
        cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
        cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
          for (let i = 0; i < expertLists.body.length; i++) {
              manualListId = expertLists.body[i].id
              cy.requestDeleteListInAthenaList(authToken, manualListId)
          }
      })
      })
    })

    cy.fixture('projectDetails').then(testData => {
      projectDetails = testData
    })
    cy.wrap(expertNamesData).each(expert => {
      cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
        expertCreateObject.firstName = expert.firstName
        expertCreateObject.lastName = expert.lastName
        expertCreateObject.originalName = expert.originalName
        expertCreateObject.email = expert.email
        cy.requestCreateExpert(authToken, expertCreateObject).then(
          expertCreateResponse =>
            createdExperts.push({
              expertId: expertCreateResponse.body.id,
              fullName: expertCreateObject.originalName,
              emailAddres: expertCreateObject.email,
              lastName: expertCreateObject.lastName,
              firstName: expertCreateObject.firstName
            })
        )
      })
    })

    cy.createProjectFromAPI(projectName, 'Expert Sessions')
  })

  beforeEach(function () {
    cy.setLocalStorageLoginInfo(localStorage.user, localStorage.token)
    cy.intercept('POST', `${Cypress.env('SEARCH_SERVICE_URL')}/expert`).as('expertSearchCall')
    cy.intercept('POST', '**/item/many').as('waitForAddingRow')
    cy.intercept('POST', '**/list').as('waitForCreateExpertList')
    cy.intercept('GET', '**/list?type=expert').as('waitForGetExpertList')
    cy.intercept('GET', '**/list/**').as('waitForGetExpertListById')
    cy.intercept('DELETE', '**/item/**').as('waitForDeletingRow')
    cy.intercept('DELETE', '**/list/**').as('waitForDeletingList')
    cy.intercept('POST', '**/list/**/share').as('waitForSharingList')
    cy.intercept('POST', '**/api/expert/sherlock-list').as('waitForSherlockList')
    cy.intercept('POST', '**/mass-action').as('waitForMassAction')
    cy.intercept('PATCH', '**/item/**').as('waitForUpdatingItem')
    cy.intercept('PATCH', '**/list/**').as('waitForUpdatingList')
    cy.intercept('GET', '**/survey').as('waitForGettingSurvey')
    cy.intercept('GET', '**/list/**/items?offset=0').as('waitToLoadItems')
    cy.intercept('GET', '**/employee/**').as('waitForEmployeeDetails')
    cy.intercept('POST', '**/mass-action/**/stop').as('waitForStop')
    cy.intercept('GET', '**/group/al_initial_outreach**').as('waitForInitialTemplate')
    cy.intercept('GET', '**/api/email-template/**').as('waitForEmailTemplate')
    cy.intercept('GET', '**/group/al_followup**').as('waitForFollowupEmailTemplate')
    cy.intercept('GET', '**/api/email-template/129').as('waitForEmailTemplate1')
    cy.intercept('GET', '**/api/email-template/132').as('waitForEmailTemplate2')
    cy.intercept('GET', '**/api/email-template/130').as('waitForEmailTemplate3')
    cy.intercept('POST', '**/api/expert/projects/**').as('waitForProjectToLoadForExpert')
    cy.intercept('POST', `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/add-to-project`).as('addToProject')
  })

  it('should pin expert on expert-search so that experts moves to Athena list', function () {
    cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/expert-search')
    cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
      if (expertLists.body.length == '0') {
        cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
      }
      else {
        cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
      }
      cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
      cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
    })

    globalPage.getClearSearchButton().click()
    expertSearchPage.getAthenaListHeading().should('contain.text', 'Athena List')
    athenaListsPage.selectNewList('AL from ES')
    cy.wait('@waitForCreateExpertList').its('response.statusCode').should('eq', 200)
    expertSearchPage.getExpertNameField().type(`${createdExperts[0].fullName}{enter}`)
    cy.wait('@expertSearchCall').its('response.statusCode').should('eq', 200)
    cy.wait(1000)
    expertSearchPage.getUniqueExpert().first().click()
    cy.wait('@waitForProjectToLoadForExpert').its('response.statusCode').should('eq', 200)
    expertDetailsPage.getAddtoAthenaListBtn().should('be.visible')
    expertDetailsPage.getAddtoAthenaListBtn().click()
    // Uncomment when pinning option is added back
    //expertSearchPage.getPinIcon().click({ force: true })
    cy.wait('@waitForAddingRow').its('response.statusCode').should('eq', 200)
    cy.visit(`${Cypress.env('LEGACY_PLATFORM_APP_URL')}/list`)
    cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
    cy.wait('@waitForEmployeeDetails').its('response.statusCode').should('eq', 200)
    athenaListsPage.getSearchList().type('AL from ES')
    cy.wait(1000)
    athenaListsPage.getNewListNameOnCard().should('have.value', 'AL from ES')
    athenaListsPage.getNewListNameOnCard().clear()
    athenaListsPage.getNewListNameOnCard().type('AL from ES updated')
    cy.wait('@waitForUpdatingList').its('response.statusCode').should('eq', 200)
    cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
      ESListId = expertLists.body.filter(AL => AL.name === 'AL from ES updated')[0].id
      athenaListsPage.getViewButtonOnCard(ESListId).click()
      cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
      cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
      athenaListsPage.getListNameOnCard().should('have.value', 'AL from ES updated')
      recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
        (experts) => experts === '1',
        {
          limit: 15,
          timeout: 15000,
          delay: 100
        }
      )
      athenaListsPage.getFirstNameInAddedRow().should('contain.text', createdExperts[0].firstName)
      athenaListsPage.getLastNameInAddedRow().should('contain.text', createdExperts[0].lastName)
      athenaListsPage.getEmailInAddedRow().should('contain.text', createdExperts[0].emailAddres, { matchCase: false })
    })
  })

  it('should add pinned experts to project from Athena list', function () {
    athenaListsPage.getSelectOption().select('Add to project')
    cy.wait('@waitForSherlockList').its('response.statusCode').should('eq', 200)
    expertInvitePage.getExpertName().should('include.text', 'Mr. ' + createdExperts[0].fullName)
    expertInvitePage.selectProjectField(projectName)
    cy.waitForLoadingDisappear()
    expertInvitePage.selectExpertSegmentField()
    cy.clickInviteActionButton('Add and invite')
    cy.waitForLoadingDisappear()
    expertInvitePage.getNumberOfExpertField().should('have.attr', 'value', projectDetails.noOfExperts)
    expertInvitePage.selectAssignedAssociatesField(employeeFullName)
    expertInvitePage.getSaveButton().click()
    cy.waitForLoadingDisappear()
    expertInvitePage.getSendEmailSenderField().should('have.text', employeeFullName)
    expertInvitePage.getSendEmailToField().contains(createdExperts[0].fullName)
    expertInvitePage.getSaveButton().click()
    cy.wait('@addToProject').its('response.statusCode').should('eq', 200)
  })


  it('should send Email to pinned experts from Athena list', function () {
    cy.reload()
    cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
    athenaListsPage.getSelectOption().select('Send email')
    cy.wait(['@waitForInitialTemplate', '@waitForInitialTemplate'])
    cy.wait(['@waitForFollowupEmailTemplate', '@waitForFollowupEmailTemplate'])
    cy.wait(['@waitForEmailTemplate1', '@waitForEmailTemplate1'])
    cy.wait(['@waitForEmailTemplate2', '@waitForEmailTemplate2'])
    // Uncomment when follow-up is introduced back
    // athenaListsPage.getNextBtnForEmail().click({force : true})
    // cy.wait('@waitForEmailTemplate1')
    // cy.wait('@waitForEmailTemplate2')
    // cy.wait('@waitForInitialTemplate').its('response.statusCode').should('eq', 200)
    // cy.wait('@waitForFollowupEmailTemplate').its('response.statusCode').should('eq', 200)
    cy.wait(6000)
    athenaListsPage.getPlaceholder().click().type('{backspace}')
    athenaListsPage.getPreviewBtn().then(($el) => {
      cy.wrap($el).click({ force: true })
    })
    athenaListsPage.getPreviewTxt().should('contain.text', 'Preview')
    cy.wait(1000)
    athenaListsPage.getExpandBtnForEmailDetail().last().should('be.visible').click()
    athenaListsPage.getEmailTo().contains(createdExperts[0].emailAddres, { matchCase: false })
    athenaListsPage.getEmailSendBtn().last().scrollIntoView().should('be.visible').click()
    cy.wait('@waitForMassAction').its('response.statusCode').should('eq', 200)
    recurse(() => athenaListsPage.getStatus().children().its('length'),
      (length) => length > 0,
      {
        limit: 20,
        timeout: 60000,
        delay: 1000
      }
    )
    athenaListsPage.statusForEmailAction().should('have.text', 'queued')
    recurse(() => athenaListsPage.statusForEmailAction().invoke('text'),
      (status) => status !== 'queued',
      {
        limit: 50,
        timeout: 180000,
        delay: 1000
      }
    )
    athenaListsPage.statusForEmailAction().should('include.text', 'Email')
    athenaListsPage.getStopBtn().click()
    cy.wait('@waitForStop').its('response.statusCode').should('eq', 200)
  })

  it('Should unpin expert in list', function () {
    cy.visit(Cypress.env('LEGACY_PLATFORM_APP_URL') + '/expert-search')
    cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
    cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
    expertSearchPage.getExpandIcon().click()
    expertSearchPage.getUnpinIcon().click()
    cy.wait('@waitForDeletingRow').its('response.statusCode').should('eq', 200)
    expertSearchPage.getGoToListIcon().click()
    cy.wait('@waitForGetExpertListById').its('response.statusCode').should('eq', 200)
    cy.wait('@waitToLoadItems').its('response.statusCode').should('eq', 200)
    recurse(() => athenaListsPage.getExpertCountOnList().invoke('text'),
      (experts) => experts === '0',
      {
        limit: 15,
        timeout: 15000,
        delay: 100
      }
    )
    athenaListsPage.getItemRows().should('have.length', 0)
  })

  it('Should able to delete list', function () {
    athenaListsPage.getDeleteIconInList().should('be.visible').click()
    athenaListsPage.getDeleteConfirmationButton().click()
    cy.wait('@waitForDeletingList').its('response.statusCode').should('eq', 200)
    cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
    cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
      for (let i = 0; i < expertLists.body.length; i++) {
        manualListId = expertLists.body[i].id
        cy.requestDeleteListInAthenaList(authToken, manualListId)
      }
    })
    cy.reload()
    cy.wait('@waitForGetExpertList').its('response.statusCode').should('eq', 200)
    cy.getExpertAthenaListByType(authToken, 'expert').then(expertLists => {
      expect(expertLists.body.length, '0')
    })
  })
})

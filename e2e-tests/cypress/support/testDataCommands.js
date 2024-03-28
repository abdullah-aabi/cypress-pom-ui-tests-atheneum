const projectDetails = require('../fixtures/projectDetails.json')
const testData = require('../fixtures/testData.json')
const testUsers = require('../fixtures/testUsers.json')
const expertDetails = require('../fixtures/expertDetails.json')
const projectRequestBody = require('../fixtures/objects/projectObject.json')
const expertSearchRequestBody = require('../fixtures/objects/expertSearchObject.json')
const eplEditObject = require('../fixtures/objects/eplEditObject.json')
const eplBulkCreateInvitedObject = require('../fixtures/objects/eplBulkCreateInvitedObject.json')
const eplBulkCreateInterestedObject = require('../fixtures/objects/eplBulkCreateInterestedObject.json')
const segmentObject = require('../fixtures/objects/segmentObject.json')

function getProjectStartDate() {
  let date = new Date()
  let d = date.getDate()
  date.setMonth(date.getMonth() + 1)
  if (date.getDate() !== d) {
    date.setDate(0)
  }
  let month = '' + (date.getMonth() + 1)
  let day = '' + date.getDate()
  let year = date.getFullYear()

  if (month.length < 2) {
    month = '0' + month
  }
  if (day.length < 2) {
    day = '0' + day
  }

  return [year, month, day].join('-')
}

function getProjectCurrentDate() {
  let date = new Date()
  let month = '' + (date.getMonth() + 1)
  let day = '' + date.getDate()
  let year = date.getFullYear()

  if (month.length < 2) {
    month = '0' + month
  }
  if (day.length < 2) {
    day = '0' + day
  }

  return [year, month, day].join('-')
}

Cypress.Commands.add('createExpertWithParameters', (authToken, expertData) => {
  cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
    expertCreateObject.firstName = expertData.firstName
    expertCreateObject.lastName = expertData.lastName
    expertCreateObject.originalName = expertData.originalName
    expertCreateObject.email = expertData.email
    const complianceSigned = (expertData.complianceSigned !== undefined) ? expertData.complianceSigned : true

    cy.requestCreateExpert(authToken, expertCreateObject).then(
      expertCreateResponse => {
        expertCreateObject = expertCreateResponse
        if (complianceSigned === true) {
          cy.requestLoginAsExpertById(expertCreateResponse.body.id).then(
            expertQuickLoginResponse => {

              cy.requestExpertAcceptCompliance(expertQuickLoginResponse.body.token)

              // WIP
              // if (expertData.confirmed === true) {
              //   // bla bla test
              //   let createBasicProfileBody = "1"
              //   cy.requestExpertCreateBasicProfile(expertQuickLoginResponse.body.token, expertCreateResponse.body.id, createBasicProfileBody)
              // }
            })
        }
      }
    ).then(() => {
      return expertCreateObject
    }
    )
  })
})

Cypress.Commands.add('deleteAccountContractsByName', (authToken, parentAccount) => {
  // GET parentAccountId
  cy.fixture('objects/clientSearchObject').then(clientSearchObject => {
    clientSearchObject.q = parentAccount

    cy.requestPostRecords(authToken, clientSearchObject).then(
      parentAccountResponse => {
        expect(parentAccountResponse.body).to.be.an('object')

        cy.requestParentAccountContractSearch(authToken, parentAccountResponse.body.hits.hits[0]._source.id).then(
          contractsResponse => {
            cy.wrap(contractsResponse.body.rows).each(contract => {
              if (contract.feeCount === 0) {
                cy.requestDeleteContractById(authToken, contract.id)
              }
            })
          }
        )
      })
  })
})

Cypress.Commands.add(
  'createProjectFromAPI',
  (
    projectName,
    projectType,
    accountManager = testUsers.accountManager.emailAddress,
    officeName = testData.officeName,
    projectStartDate = undefined
  ) => {
    let authToken
    // GET Employee Auth Token
    cy.requestLogIn(accountManager, Cypress.env('CYPRESS_USER_PASSWORD')).then(
      loginEmployeeResponse => {
        expect(loginEmployeeResponse.body).to.be.an('object')
        authToken = loginEmployeeResponse.body.token

        // GET offices
        cy.fixture('objects/clientSearchObject').then(clientSearchObject => {
          clientSearchObject.q = officeName

          cy.requestPostRecords(authToken, clientSearchObject).then(
            officesResponse => {
              expect(officesResponse.body).to.be.an('object')
              const officeId =
                officesResponse.body.hits.hits[0]._source.accounts[0].offices[0]
                  .id

              cy.requestGetOfficeById(authToken, officeId).then(
                officesResponse => {
                  expect(officesResponse.body).to.be.an('object')
                  const office = officesResponse.body

                  projectRequestBody.officeId = office.id
                  projectRequestBody.office.id = office.id
                  projectRequestBody.office.officeName = office.officeName
                  projectRequestBody.office.account.id = office.accountId
                  projectRequestBody.office.account.companyName =
                    office.account.companyName
                  projectRequestBody.office.account.parentAccountId =
                    office.parentAccountId
                  projectRequestBody.office.accountId = office.accountId

                  projectRequestBody.clients[0].id = office.clients[0].id
                  projectRequestBody.clients[0].fullName =
                    office.clients[0].fullName
                  projectRequestBody.clients[0].office.id = office.id
                  projectRequestBody.clients[0].office.oldNid =
                    office.clients[0].client.oldNid
                  projectRequestBody.clients[0].office.officeName =
                    office.officeName
                  projectRequestBody.clients[0].office.accountId =
                    office.accountId
                  projectRequestBody.clients[0].office.parentAccountId =
                    office.parentAccountId
                  projectRequestBody.clients[0].office.addressId =
                    office.addressId
                  projectRequestBody.clients[0].office.placeholder =
                    office.placeholder
                  projectRequestBody.clients[0].office.updatedBy =
                    office.clients[0].client.updatedBy
                  projectRequestBody.clients[0].office.created_at =
                    office.clients[0].client.created_at
                  projectRequestBody.clients[0].office.updated_at =
                    office.clients[0].client.updated_at

                  projectRequestBody.projectName = projectName
                  projectRequestBody.projectManagerId = loginEmployeeResponse.body.user.id

                  projectRequestBody.employees[0].id =
                    loginEmployeeResponse.body.user.id
                  projectRequestBody.employees[0].fullName =
                    loginEmployeeResponse.body.user.fullName
                  projectRequestBody.employees[0].positionId =
                    loginEmployeeResponse.body.user.userTypeId
                  projectRequestBody.employees[0].employeeToProject.employeeId =
                    loginEmployeeResponse.body.user.id

                  cy.requestGetStaticData(authToken).then(
                    staticDataResponse => {
                      expect(staticDataResponse.body).to.be.an('object')

                      const projectTypeId = staticDataResponse.body.projectTypes.filter(
                        projectTypeElement =>
                          projectTypeElement.name === projectType
                      )[0]
                      const subIndustry = staticDataResponse.body.subIndustries.filter(
                        subIndustryData =>
                          subIndustryData.name === projectDetails.subIndustry
                      )[0]
                      const projectCategory = staticDataResponse.body.projectCategories.filter(
                        projectCategoryData =>
                          projectCategoryData.name === projectDetails.projectCategory
                      )[0]
                      const projectStatus = staticDataResponse.body.projectStatuses.filter(
                        projectStatusData =>
                          projectStatusData.name === projectDetails.status
                      )[0]
                      const projectRequiredResources = staticDataResponse.body.projectRequiredResources.filter(
                        requireResource =>
                          requireResource.name ===
                          projectDetails.requiredResources
                      )[0]

                      projectRequestBody.projectTypeId = projectTypeId.id
                      projectRequestBody.subIndustryId = subIndustry.id
                      projectRequestBody.subIndustry.id = subIndustry.id
                      projectRequestBody.subIndustry.name = subIndustry.name
                      projectRequestBody.subIndustry.industryId =
                        subIndustry.industryId

                      projectRequestBody.industryId = subIndustry.industryId
                      projectRequestBody.projectCategoryId = projectCategory.id

                      projectRequestBody.background = `<p>${projectDetails.background
                        }</p>`
                      projectRequestBody.interviewTarget =
                        projectDetails.targetNoOfInterviews

                      projectRequestBody.segments[0].name =
                        projectDetails.segmentTitle
                      projectRequestBody.segments[0].numberOfExpert =
                        projectDetails.noOfExperts
                      projectRequestBody.segments[0].expertBrief = `We are working on a project for a client who is looking at {{projectName}}. In connection with this, our client is trying to gain a better understanding of ${projectDetails.expertBrief
                        }`
                      projectRequestBody.segments[0].screeningQuestions.length = 0
                      projectRequestBody.segments[0].screeningQuestions.push({
                        question: `<p>${projectDetails.screeningDefaultQuestion
                          }</p>`
                      })
                      projectRequestBody.segments[0].screeningQuestions.push({
                        question: `<p>${projectDetails.screeningQuestion1}</p>`
                      })
                      projectRequestBody.segments[0].screeningQuestions.push({
                        question: `<p>${projectDetails.screeningQuestion2}</p>`
                      })

                      projectRequestBody.projectStatusId = projectStatus.id
                      projectRequestBody.projectRequiredResourcesId =
                        projectRequiredResources.id

                      projectRequestBody.startDate =
                        typeof projectStartDate !== 'undefined'
                          ? projectStartDate
                          : getProjectStartDate()

                      // Create project
                      cy.requestCreateProject(authToken, projectRequestBody)
                    }
                  )
                }
              )
            }
          )
        })
      }
    )
  }
)

Cypress.Commands.add(
  'addAndInviteExpertToProjectFromAPI',
  (
    projectId,
    expertData,
    accountManager = testUsers.accountManager.emailAddress
  ) => {
    let authToken

    cy.requestLogIn(accountManager, Cypress.env('CYPRESS_USER_PASSWORD')).then(
      loginEmployeeResponse => {
        expect(loginEmployeeResponse.body).to.be.an('object')
        authToken = loginEmployeeResponse.body.token
        expertSearchRequestBody.expertData = expertData

        cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
          expertsResponse => {
            expect(expertsResponse.body).to.be.an('object')

            // you can pass expertId as directly expertData
            let expertId = !isNaN(expertData) ? expertData : expertsResponse.body.hits.hits[0]._source.id

            cy.requestGetExpertById(authToken, expertId).then(
              expertResponse => {
                expect(expertResponse.body).to.be.an('object')

                eplBulkCreateInvitedObject.expertProjectLinks[0].expertId = expertId
                eplBulkCreateInvitedObject.expertProjectLinks[0].cvId =
                  expertResponse.body.cv.id
                eplBulkCreateInvitedObject.expertProjectLinks[0].experienceId =
                  expertResponse.body.cv.experiences[0].id
                eplBulkCreateInvitedObject.expertProjectLinks[0].projectId = projectId

                eplBulkCreateInvitedObject.templateData.to.length = 0
                eplBulkCreateInvitedObject.templateData.to.push({
                  email: expertResponse.body.email,
                  name: expertResponse.body.fullName
                })

                eplBulkCreateInvitedObject.templateData.senderId =
                  loginEmployeeResponse.body.user.id

                cy.requestEPLBulkValidate(authToken, {
                  projectId: projectId,
                  expertIds: [expertId]
                })

                cy.requestGetProjectSegments(authToken, projectId).then(
                  segmentsResponse => {
                    expect(segmentsResponse.body).to.be.an('array')

                    eplBulkCreateInvitedObject.expertProjectLinks[0].segment.id =
                      segmentsResponse.body[0].id

                    segmentObject.employees.length = 0
                    segmentObject.screeningQuestions.length = 0

                    segmentObject.employees.push(
                      loginEmployeeResponse.body.user.id
                    )

                    segmentsResponse.body[0].screeningQuestions.forEach(
                      question => {
                        delete question.segmentId
                        delete question.updatedBy
                        delete question.created_at
                        delete question.updated_at
                        segmentObject.screeningQuestions.push(question)
                      }
                    )

                    segmentObject.name = segmentsResponse.body[0].name
                    segmentObject.numberOfExpert =
                      segmentsResponse.body[0].numberOfExpert
                    segmentObject.expertBrief =
                      segmentsResponse.body[0].expertBrief

                    cy.requestCreateProjectSegment(
                      authToken,
                      segmentsResponse.body[0].id,
                      segmentObject
                    )

                    cy.requestEmployeeMultiple(authToken, {
                      ids: [loginEmployeeResponse.body.user.id]
                    })

                    cy.requestEPLBulkCreate(
                      authToken,
                      eplBulkCreateInvitedObject
                    ).then(EPLBulkCreateResponse => {
                      expect(EPLBulkCreateResponse.body).to.be.an('array')

                      eplEditObject.industryExpertise = expertResponse.body.expert.industryExpertise
                      eplEditObject.screening = `<p>${expertDetails.expertScreeningInfo}</p>`
                      eplEditObject.relevantExperienceId = expertResponse.body.cv.experiences[0].id
                      eplEditObject.expertAvailability = `<p>${expertDetails.expertAvailability}</p>`
                      eplEditObject.cvId = expertResponse.body.cv.id

                      cy.requestPutEPLv2(authToken, EPLBulkCreateResponse.body[0].id, eplEditObject)
                    })
                  }
                )
              }
            )
          }
        )
      }
    )
  }
)

Cypress.Commands.add(
  'addAndInviteExpertIdToProjectFromAPI',
  (
    projectId,
    expertId,
    accountManager = testUsers.accountManager.emailAddress
  ) => {
    let authToken

    cy.requestLogIn(accountManager, Cypress.env('CYPRESS_USER_PASSWORD')).then(
      loginEmployeeResponse => {
        expect(loginEmployeeResponse.body).to.be.an('object')
        authToken = loginEmployeeResponse.body.token
        cy.requestGetExpertById(authToken, expertId).then(expertResponse => {
          expect(expertResponse.body).to.be.an('object')

          eplBulkCreateInvitedObject.expertProjectLinks[0].expertId = expertId
          eplBulkCreateInvitedObject.expertProjectLinks[0].cvId =
            expertResponse.body.cv.id
          eplBulkCreateInvitedObject.expertProjectLinks[0].experienceId =
            expertResponse.body.cv.experiences[0].id
          eplBulkCreateInvitedObject.expertProjectLinks[0].projectId = projectId
          eplBulkCreateInvitedObject.templateData.length = 0

          eplBulkCreateInvitedObject.templateData.to.push({
            email: expertResponse.body.email,
            name: expertResponse.body.fullName
          })

          eplBulkCreateInvitedObject.templateData.senderId =
            loginEmployeeResponse.body.user.id

          cy.requestEPLBulkValidate(authToken, {
            projectId: projectId,
            expertIds: [expertId]
          })

          cy.requestGetProjectSegments(authToken, projectId).then(
            segmentsResponse => {
              expect(segmentsResponse.body).to.be.an('array')

              eplBulkCreateInvitedObject.expertProjectLinks[0].segment.id =
                segmentsResponse.body[0].id

              segmentObject.employees.length = 0
              segmentObject.screeningQuestions.length = 0
              segmentObject.employees.push(loginEmployeeResponse.body.user.id)

              segmentsResponse.body[0].screeningQuestions.forEach(question => {
                delete question.segmentId
                delete question.updatedBy
                delete question.created_at
                delete question.updated_at
                segmentObject.screeningQuestions.push(question)
              })

              segmentObject.name = segmentsResponse.body[0].name
              segmentObject.numberOfExpert =
                segmentsResponse.body[0].numberOfExpert
              segmentObject.expertBrief = segmentsResponse.body[0].expertBrief

              cy.requestCreateProjectSegment(
                authToken,
                segmentsResponse.body[0].id,
                segmentObject
              )

              cy.requestEmployeeMultiple(authToken, {
                ids: [loginEmployeeResponse.body.user.id]
              })

              cy.requestEPLBulkCreate(authToken, eplBulkCreateInvitedObject)
            }
          )
        })
      }
    )
  }
)

Cypress.Commands.add(
  'addExpertAsInterestedToProjectFromAPI',
  (
    projectId,
    expertId,
    accountManager = testUsers.accountManager.emailAddress
  ) => {
    let authToken

    cy.requestLogIn(accountManager, Cypress.env('CYPRESS_USER_PASSWORD')).then(
      loginEmployeeResponse => {
        expect(loginEmployeeResponse.body).to.be.an('object')

        authToken = loginEmployeeResponse.body.token

        cy.requestGetExpertById(authToken, expertId).then(expertResponse => {
          expect(expertResponse.body).to.be.an('object')

          eplBulkCreateInterestedObject.expertProjectLinks[0].expertId = expertId
          eplBulkCreateInterestedObject.expertProjectLinks[0].cvId =
            expertResponse.body.cv.id
          eplBulkCreateInterestedObject.expertProjectLinks[0].experienceId =
            expertResponse.body.cv.experiences[0].id
          eplBulkCreateInterestedObject.expertProjectLinks[0].projectId = projectId

          cy.requestEPLBulkValidate(authToken, {
            projectId: projectId,
            expertIds: [expertId]
          })

          cy.requestGetProjectSegments(authToken, projectId).then(
            segmentsResponse => {
              expect(segmentsResponse.body).to.be.an('array')

              eplBulkCreateInterestedObject.expertProjectLinks[0].segment =
                segmentsResponse.body[0]

              cy.requestGetStaticData(authToken).then(staticDataResponse => {
                expect(staticDataResponse.body).to.be.an('object')

                const replyStatusInterested = staticDataResponse.body.replyStatuses.filter(
                  replyStatusRow => replyStatusRow.name === 'Interested'
                )[0]

                eplBulkCreateInterestedObject.expertProjectLinks[0].replyStatusId =
                  replyStatusInterested.id

                cy.requestEPLBulkCreate(
                  authToken,
                  eplBulkCreateInterestedObject
                )
              })
            }
          )
        })
      }
    )
  }
)

Cypress.Commands.add('deleteProjectAndEPLs', projectId => {
  let authToken

  cy.requestLogIn(
    Cypress.env('CYPRESS_ADMIN_USERNAME'),
    Cypress.env('CYPRESS_ADMIN_PASSWORD')
  ).then(loginResponse => {
    expect(loginResponse.body).to.be.an('object')
    authToken = loginResponse.body.token

    cy.requestGetStaticData(authToken).then(staticDataResponse => {
      expect(staticDataResponse.body).to.be.an('object')

      const eplStatusInterviewed = staticDataResponse.body.eplStatuses.filter(
        eplStatusRow => eplStatusRow.name === 'Interviewed'
      )[0]
      const eplStatusNotInterviewed = staticDataResponse.body.eplStatuses.filter(
        eplStatusRow => eplStatusRow.name === 'Not interviewed'
      )[0]
      const eplStatusCommentOthers = staticDataResponse.body.eplStatusComments.filter(
        eplStatusRow => eplStatusRow.name === 'Others'
      )[0]

      cy.requestPostProjectPipeline(authToken, projectId, { filters: {} }).then(
        projectPipelineResponse => {
          expect(projectPipelineResponse.body).to.be.an('array')
          projectPipelineResponse.body.forEach(projectPipeline => {
            if (projectPipeline.feeEntry !== null) {
              cy.log(projectPipeline.feeEntry)
              cy.requestDeleteFee(authToken, projectPipeline.feeEntry.id)
            }
            if (projectPipeline.eplStatusId === eplStatusInterviewed.id) {
              cy.requestGetEPL(authToken, projectPipeline.id).then(
                eplResponse => {
                  expect(eplResponse.body).to.be.an('object')

                  eplResponse.body.interviewCanceledDate = getProjectCurrentDate()
                  eplResponse.body.eplStatusId = eplStatusNotInterviewed.id
                  eplResponse.body.eplStatusCommentId =
                    eplStatusCommentOthers.id

                  cy.requestPutEPL(
                    authToken,
                    projectPipeline.id,
                    eplResponse.body
                  )
                }
              )
            }
          })

          cy.requestDeleteProject(authToken, projectId)
        }
      )
    })
  })
})

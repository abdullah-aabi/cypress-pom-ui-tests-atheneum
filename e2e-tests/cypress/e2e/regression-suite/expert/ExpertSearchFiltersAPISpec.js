const initExpertSearchRequestBody = require('../../../fixtures/objects/expertSearchObject.json')
const faker = require('faker')

const {
  getRandomInt,
  generateFirstName,
  generateLastName,
  generateTestName
} = require('../../../support/generator')

describe('Expert relationship manager API searching for experts', { tags: "regression" }, function () {
  let authToken,
    expertsData,
    createdExpert,
    createdExpertPastExperience,
    expertSearchRequestBody,
    staticDataResponse

  const fakerCompany = faker.company.companyName()
  const fakerPastCompany = faker.company.companyName()

  before(function () {
    cy.clearLocalAndSessionStorage()
    cy.fixture('testUsers').then(testUsers => {
      cy.requestLogIn(
        testUsers.erm.emailAddress,
        Cypress.env('CYPRESS_USER_PASSWORD')
      ).then(loginResponse => {
        cy.setLocalStorageLoginInfo(
          loginResponse.body.user,
          loginResponse.body.token
        )
        authToken = loginResponse.body.token
        cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
          expertCreateObject.firstName = generateFirstName()
          expertCreateObject.lastName = generateLastName()
          expertCreateObject.originalName = `${expertCreateObject.firstName} ${expertCreateObject.lastName
            }`
          expertCreateObject.email = `${expertCreateObject.firstName +
            expertCreateObject.lastName}@mail.com`
          expertCreateObject.address.phones[0].phoneNum = faker.phone.phoneNumber('+48 ## ### ## ##')
          expertCreateObject.expert.industryExpertise = expertCreateObject.expert.industryExpertise.replace('Automation', generateTestName())
          expertCreateObject.experiences[0].company = fakerCompany

          cy.requestCreateExpert(authToken, expertCreateObject).then(
            expertCreateResponse => {
              createdExpert = expertCreateResponse.body
            }
          )
        })

        cy.fixture('expertDetails').then(expertDetails => {
          cy.fixture('objects/expertCreateObject').then(expertCreateObject => {
            expertCreateObject.firstName = generateFirstName()
            expertCreateObject.lastName = generateLastName()
            expertCreateObject.originalName = `${expertCreateObject.firstName
              } ${expertCreateObject.lastName}`
            expertCreateObject.email = `${expertCreateObject.firstName +
              expertCreateObject.lastName}@mail.com`
            expertCreateObject.experiences = expertDetails.experiences
            expertCreateObject.address.phones[0].phoneNum = faker.phone.phoneNumber('+48 ## ### ## ##')
            expertCreateObject.expert.industryExpertise = expertCreateObject.expert.industryExpertise.replace('Automation', generateTestName())
            expertCreateObject.experiences[1].company = fakerPastCompany

            cy.requestCreateExpert(authToken, expertCreateObject).then(
              expertCreateResponse => {
                createdExpertPastExperience = expertCreateResponse.body
              }
            )
          })
        })

        cy.requestGetStaticData(authToken).then(staticData => {
          staticDataResponse = staticData.body
        })
      })
    })
  })

  beforeEach(function () {
    cy.requestSearchExperts(authToken, initExpertSearchRequestBody).then(
      expertSearchResult => {
        const randomExpertIndex = getRandomInt(
          expertSearchResult.body.hits.hits.length
        )
        expertsData = expertSearchResult.body.hits.hits[randomExpertIndex]._source
      }
    )
    expertSearchRequestBody = JSON.parse(
      JSON.stringify(initExpertSearchRequestBody)
    )
  })

  it('should search the experts by including screening information', function () {
    expertSearchRequestBody.includeScreeningInformation = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should search the experts by interviewed true', function () {
    expertSearchRequestBody.interviewed = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should search the expert by phrase and boolean operators', function () {
    const expertKeyword = '"Expertise" NOT * Purchasing'
    expertSearchRequestBody.keyword = expertKeyword

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should search the expert by name', { tags: "smoke" }, function () {
    expertSearchRequestBody.expertData = createdExpert.originalName

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should search the expert by email', function () {
    expertSearchRequestBody.expertData = expertsData.email

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(expertsData.fullName)
        expect(expertSearchResult.body.hits.hits[0]._source.email).to.eq(expertsData.email)
      }
    )
  })

  it('should search the expert by phone', function () {
    expertSearchRequestBody.expertData =
      createdExpert.address.phones[0].phoneNum

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should search the expert by expert code', function () {
    expertSearchRequestBody.expertData = createdExpert.expert.expertCode

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should filter the experts by Company', { tags: "smoke" }, function () {
    expertSearchRequestBody.companies = ['Atheneum']

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should search by name and filter by Position', { tags: "smoke" }, function () {
    expertSearchRequestBody.positions = [
      createdExpert.cv.experiences[0].position.name
    ]
    expertSearchRequestBody.expertData = createdExpert.fullName

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should filter Company and by Past and Current Position', function () {
    expertSearchRequestBody.companies = [fakerCompany]
    expertSearchRequestBody.positions = [createdExpert.cv.experiences[0].position.name]

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should filter by Company and Current Position', function () {
    expertSearchRequestBody.companies = [fakerCompany]
    expertSearchRequestBody.positions = [createdExpert.cv.experiences[0].position.name]
    expertSearchRequestBody.experiencePeriod = 'CURRENT'

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should filter by Company and Past Position', function () {
    expertSearchRequestBody.companies = [fakerPastCompany]
    expertSearchRequestBody.positions = [createdExpertPastExperience.cv.experiences[1].position.name]
    expertSearchRequestBody.experiencePeriod = 'PAST'

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpertPastExperience.originalName)
      }
    )
  })

  it('should filter the experts by Active Status', function () {
    expertSearchRequestBody.expertStatus.activeExpert = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts with Compliance', function () {
    expertSearchRequestBody.complianceFilter = 1

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts without Compliance', function () {
    expertSearchRequestBody.complianceFilter = 2

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts with HF Compliance', function () {
    expertSearchRequestBody.hfComplianceFilter = 1

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts without HF Compliance', function () {
    expertSearchRequestBody.hfComplianceFilter = 2

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by country', function () {
    const country = expertsData.country

    expertSearchRequestBody.country = [country]

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
          expertSearchResult.body.hits.hits.forEach(expert => {
            expect(expert._source.country).to.eq(country)
          })
        }
      }
    )
  })

  it('should filter the experts by state', function () {
    const state = (JSON.stringify(expertsData.addressState)).replaceAll('"', '')

    expertSearchRequestBody.addressState = [state]

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
          expertSearchResult.body.hits.hits.forEach(expert => {
            expect(expert._source.addressState).to.eq(state)
          })
        }
      }
    )
  })

  it('should search the expert by keyword or phrase', function () {
    const expertKeyword = `"${createdExpert.expert.industryExpertise
      .replace('<p>', '')
      .replace('</p>', '')}"`
    expertSearchRequestBody.keyword = expertKeyword

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        expect(expertSearchResult.body.hits.hits.length).to.eq(1)
        expect(expertSearchResult.body.hits.hits[0]._source.fullName).to.eq(createdExpert.originalName)
      }
    )
  })

  it('should filter the experts by Industry', function () {
    const industryName = expertsData.industry

    expertSearchRequestBody.industry = [industryName]

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
          expertSearchResult.body.hits.hits.forEach(expert => {
            expect(expert._source.industry).to.eq(industryName)
          })
        }
      }
    )
  })

  it('should filter the experts by language and proficiency', function () {
    const language = staticDataResponse.languages.filter(
      language => language.id === createdExpert.languages[0].id
    )[0].name
    const languageProficiency = staticDataResponse.languageProficiencies.filter(
      language =>
        language.id ===
        createdExpert.languages[0].languageToUser.languageProficiencyId
    )[0].name

    expertSearchRequestBody.languages = [language]
    expertSearchRequestBody.proficiency = languageProficiency

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - Email', function () {
    expertSearchRequestBody.hasEmail = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - HasApp', function () {
    expertSearchRequestBody.hasApp = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - Personal phone', function () {
    expertSearchRequestBody.hasPersonalPhone = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - Office phone', function () {
    expertSearchRequestBody.hasOfficePhone = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - Mobile phone', function () {
    expertSearchRequestBody.hasMobilePhone = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - Direct phone', function () {
    expertSearchRequestBody.hasDirectPhone = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Contacts - WhatsApp', function () {
    expertSearchRequestBody.hasWhatsapp = true

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Created in - 2022', function () {
    expertSearchRequestBody.createdIn = [2022]

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should filter the experts by Similar to', function () {
    expertSearchRequestBody.similarTo = [expertsData.id]

    cy.requestSearchExperts(authToken, expertSearchRequestBody).then(
      expertSearchResult => {
        if (expertSearchResult.body.hits.hits.length > 0) {
          expect(expertSearchResult.body.hits.hits.length).greaterThan(0)
        }
      }
    )
  })

  it('should search the expert by expert name using Search Anything method', function () {
    cy.requestQuickSearch(authToken, createdExpert.fullName).then(
      searchResults => {
        const expert = searchResults.body.filter(experts => experts.fullName === createdExpert.fullName)[0]
        expect(expert.fullName).to.eq(createdExpert.fullName)
        expect(expert.indexType).to.eq('expert')
      }
    )
  })
})

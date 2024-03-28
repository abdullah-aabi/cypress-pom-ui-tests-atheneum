// ***********************************************
// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
import '@4tw/cypress-drag-drop'
import 'cypress-file-upload'
import 'cypress-wait-until';
import { recurse } from 'cypress-recurse'

Cypress.Commands.add("parseXlsx", (inputFile) => {
  cy.readFile(inputFile, { timeout: 15000 }).then(file => {
    return cy.task('parseXlsx', inputFile)
  })
});

Cypress.Commands.add('loginWithCredentials', (username, password, external) => {
  cy.get('[name=login]')
    .should('be.visible')
    .type(username)
  cy.get('[name=password]')
    .should('be.visible')
    .type(password)
  cy.get('.button--primary')
    .should('be.visible')
    .click()
  if (external) {
    return cy.get('.sub-header__title').should('exist')
  }
  return cy.get('.header .header__profile-image').should('exist')
})

Cypress.Commands.add(
  'setLocalStorageLoginInfo',
  (userInfo, userAccessToken, userType) => {
    if (userType === 'expert') {
      window.localStorage.setItem('expertAccessToken', userAccessToken)
      expect(window.localStorage.getItem('expertAccessToken')).to.eq(
        userAccessToken
      )
    }
    if (userType === 'client') {
      cy.visit(Cypress.env('CLIENTS_PLATFORM_APP_URL'), {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('clientAccessToken', userAccessToken)
          expect(win.localStorage.getItem('clientAccessToken')).to.eq(
            userAccessToken
          )
        }
      })
    }
    else {
      window.localStorage.setItem('ngStorage-user', JSON.stringify(userInfo))
      window.localStorage.setItem('ngStorage-accessToken', userAccessToken)
      expect(window.localStorage.getItem('ngStorage-user')).to.eq(
        JSON.stringify(userInfo)
      )
      expect(window.localStorage.getItem('ngStorage-accessToken')).to.eq(
        userAccessToken
      )
    }
  }
)

Cypress.Commands.add('setNewUX', () => {
  window.localStorage.setItem('FS_UX', true)
})

Cypress.Commands.add('uploadAttachmentFile', (filePath, fileName) => {
  let fileType

  switch (fileName.match(/^(.*?)TestFile/)[1]) {
    case 'Excel':
      fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    case 'PDF':
      fileType = 'application/pdf'
      break
    case 'Word':
      fileType = 'application/msword'
      break
    default:
      fileType = ''
  }

  cy.get('input[type="file"]').attachFile({
    fileContent: filePath,
    fileName: fileName,
    mimeType: fileType
  });
});

Cypress.Commands.add('waitForLoadingDisappear', () => {
  cy.get('.spinner').should('not.exist')
})

Cypress.Commands.add('clearLocalAndSessionStorage', () => {
  window.localStorage.clear()
  window.sessionStorage.clear()

  // eslint-disable-next-line no-unused-expressions
  expect(window.localStorage.getItem('ngStorage-user')).to.be.null
  // eslint-disable-next-line no-unused-expressions
  expect(window.localStorage.getItem('ngStorage-accessToken')).to.be.null
})

Cypress.Commands.add('selectExpert', expertName => {
  cy.get('.spinner').should('not.be.visible')
  cy.get('div.expert-search-item').each(($el, index, $list) => {
    const textProject = $el.text()
    cy.log(textProject)
    if (textProject.includes(expertName)) {
      $el.click()
    }
  })
})

Cypress.Commands.add('clickInviteActionButton', inviteActionName => {
  cy.get('.segment-actions .button')
    .contains(inviteActionName)
    .should('not.have.attr', 'disabled', 'disabled')
    .click()
})

Cypress.Commands.add('clickEplExpertEyeIcon', expertName => {
  cy.get('.single__content__thumb')
    .contains(expertName)
    .each(($el, index, $list) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        cy.get('.single__content__thumb')
          .find('.icons .star-icon')
          .eq(index)
          .should('be.visible')
          .click()
      }
    })
})

Cypress.Commands.add('clickButtonByText', buttonText => {
  cy.get('button')
    .contains(buttonText)
    .should('exist')
    .click()
})

Cypress.Commands.add('clickEplExpertToExpand', expertName => {
  cy.get('.single__content__thumb')
    .contains(expertName)
  cy.get('.single__content__thumb')
    .each(($el, index, $list) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        cy.get('.single__content__thumb')
          .eq(index)
          .click()
      }
    })
})

Cypress.Commands.add('clickInviteActionContent', inviteContent => {
  cy.get('.request-schedule__invite-action').each(($el, index, $list) => {
    const inviteText = $el.text()
    if (inviteText.includes(inviteContent)) {
      $el.click()
    }
  })
})

Cypress.Commands.add(
  'verifyExpertReplyStatus',
  (expertName, expectedStatus) => {
    cy.get('.single__content__thumb').contains(expertName)
    cy.get('.single__content__thumb').each(($el, index, $list) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        cy.get('.single__content__thumb')
          .find('[data-cy="reply-status-dropdown"]')
          .eq(index)
          .then(function (status) {
            const actualStatus = status.text()
            expect(actualStatus).to.equal(` ${expectedStatus} `)
          })
      }
    })
  }
)

Cypress.Commands.add(
  'getChildrenByParentName',
  (parentLocator, parentName, childrenLocator, childrenValue) => {
    cy.get(parentLocator)
      .should('contain', parentName)
      .should('be.visible')
      .each(($el, index, $list) => {
        cy.log($el.text())
        if ($el.text().includes(parentName)) {
          return cy
            .wrap($el)
            .find(childrenLocator)
            .should('contain', childrenValue)
        }
      })
  }
)

Cypress.Commands.add(
  'selectFilterByCriteria',
  (filterField, filterCriteria, expand) => {
    cy.get('.search-group').each(($el, index, $list) => {
      const filterFieldName = $el.text()
      if (filterFieldName.indexOf(filterField) !== -1) {
        if (expand) {
          cy.wrap($el)
            .click()
            .find('input[role="combobox"]')
            .type(filterCriteria, { delay: 30 })
        } else {
          cy.wrap($el)
            .find('input[role="combobox"]')
            .type(filterCriteria, { delay: 30 })
        }
      }
    })
  }
)

Cypress.Commands.add(
  'selectFilterByLocation',
  (filterField, filterCriteria, position) => {
    cy.get('.search-group').each(($el) => {
      const filterFieldName = $el.text()
      if (filterFieldName.indexOf(filterField) !== -1) {
        cy.wrap($el)
          .find('input[role="combobox"]').eq(position)
          .type(filterCriteria, { delay: 30 })
      }
    })
  }
)

Cypress.Commands.add('changeEPLStatus', (expertName, eplStatus) => {
  cy.get('.single__content__thumb').contains(expertName)
  cy.get('.single__content__thumb').each(($el, index, $list) => {
    const expertNameText = $el.text()
    if (expertNameText.includes(expertName)) {
      cy.get('[data-cy="epl-status-dropdown"]')
        .should('have.length', $list.length)

      cy.get('[data-cy="epl-status-dropdown"]')
        .should('be.visible')
        .eq(index)
        .click()

      cy.get('.autocomplete__results-container .autocomplete__item')
        .should('be.visible')
        .contains(eplStatus)
        .click()
    }
  })
})

Cypress.Commands.add('checkEPLStatusForCapi', (expertName, eplStatus) => {
  recurse(() =>
    cy.get(`.single__content__thumb:contains(${expertName})`)
      .find('[data-cy="epl-status-dropdown"] button.autocomplete__input').invoke('text'),
    (actualStatus) =>
      expect(actualStatus).to.equal(eplStatus),
    {
      limit: 5,
      timeout: 40000,
      delay: 1000,
      post() {
        cy.reload()
      },
      error: `Expected to find an EPL for ${expertName} with status: ${eplStatus}`,
    },
  )
})

Cypress.Commands.add('checkEPLStatus', (expertName, eplStatus) => {
  // cy.get('.single__content__thumb').contains(expertName)
  cy.waitUntil(() => {
    let success = false
    return cy.get('.single__content__thumb').each(($el, index, $list) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        cy.get('.single__content__thumb')
          .eq(index)
          .find('[data-cy="epl-status-dropdown"] button.autocomplete__input')
          .then(function (status) {
            const actualStatus = status.text()
            if (eplStatus === actualStatus) {
              success = true
            }
          })
      }
    }).then(() => success)


  }, {
    errorMsg: `Expected to find an EPL for ${expertName} with status: ${eplStatus}`,
    timeout: 10000
  })
})

Cypress.Commands.add('checkEPLButtonIsDisabled', (expertName) => {
  return cy.get('.single__content__thumb').each(($el, index, $list) => {
    const expertNameText = $el.text()
    if (expertNameText.includes(expertName)) {
      cy.get('.single__content__thumb')
        .eq(index)
        .find('[data-cy="epl-status-dropdown"] button.autocomplete__input').should('have.attr', 'disabled', 'disabled')
    }
  })
})

Cypress.Commands.add('changeEPLVisibility', expertName => {
  cy.get('.single__content__thumb').contains(expertName)
  cy.get('.single__content__thumb').each(($el, index, $list) => {
    const expertNameText = $el.text()
    if (expertNameText.includes(expertName)) {
      cy.get('.icons .star-icon')
        .eq(index)
        .click()
    }
  })
})

Cypress.Commands.add('RevertEPLStatusToRejected', expertName => {
  cy.get('.single__content__thumb').each(($el, index, $list) => {
    const expertNameText = $el.text()
    if (
      expertNameText.includes(expertName) &&
      cy
        .get('button.autocomplete__input--blue')
        .eq(index)
        .contains('Scheduled')
    ) {
      cy.wait(1100)
      cy.get('.single__content__thumb')
        .find('button.autocomplete__input--blue')
        .eq(index)
        .click()
      cy.get('.autocomplete__item')
        .contains('div', 'Rejected')
        .click()
    }
  })
})

Cypress.Commands.add('verifyEplSubmitColor', (expertName, starColor) => {
  cy.get('.single__content__thumb')
    .contains(expertName)
    .should('be.visible')
    .each(($el, index, $list) => {
      const expertNameText = $el.text()
      if (expertNameText.includes(expertName)) {
        cy.get('.icons > :nth-child(1)')
          .should('be.visible')
          .eq(index)
          .should('have.css', 'color', starColor)
      }
    })
})

Cypress.Commands.add('verifyExpertNameNotVisibleOnClientView', expertName => {
  cy.get('.project-segment .epl__content').each(($el, index, $list) => {
    const eplClientViewText = $el.text()
    cy.log(eplClientViewText)
    expect(eplClientViewText).not.to.include(expertName)
  })
})

Cypress.Commands.add('cleanupExpertsByName', (authToken, fullName) => {
  cy.fixture('objects/expertSearchObject').then(expertSearch => {
    expertSearch.expertData = fullName
    cy.requestSearchExperts(authToken, expertSearch).then(
      expertSearchResponse => {
        if (expertSearchResponse.body.hits.hits.length !== 0) {
          cy.requestDeleteExpertById(
            authToken,
            expertSearchResponse.body.hits.hits[0]._source.id
          )
          cy.log(
            `Expert ${expertSearchResponse.body.hits.hits[0]._source.id
            } deleted!`
          )
        }
      }
    )
  })
})

Cypress.Commands.add('adminCleanupProjectByClient', clientCompanyName => {
  cy.fixture('objects/projectSearch').then(projectSearchObject => {
    cy.requestLogIn(
      Cypress.env('CYPRESS_ADMIN_USERNAME'),
      Cypress.env('CYPRESS_ADMIN_PASSWORD')
    ).then(loginResponse => {
      const authToken = loginResponse.body.token

      projectSearchObject.account = clientCompanyName
      cy.requestSearchProject(authToken, projectSearchObject).then(
        projectResultsResponse => {
          expect(projectResultsResponse.body).to.be.an('object')

          if (projectResultsResponse.body.hits.hits.length !== 0) {
            projectResultsResponse.body.hits.hits.forEach(projectData => {
              cy.deleteProjectAndEPLs(projectData._source.id)
            })
          }
          cy.log('Cleanup successfull')
        }
      )
    })
  })
})

Cypress.Commands.add('clickToGoToFirstAvailableSlot', FASContent => {
  cy.get('div.slice-wrapper.first_match :nth-child(2) :nth-child(2)').scrollIntoView().each(
    ($el, index, $list) => {
      const inviteText = $el.text()
      if (inviteText.includes(FASContent)) {
        $el.click()
      }
    }
  )
})

Cypress.Commands.add('verifyNotificationAndClose', () => {
  cy.get('.notification-wrapper__single__title').should('have.text', 'Success!')
  cy.get('.notification-wrapper__single__message')
    .first()
    .should('have.text', 'EPL successfully updated.')
  cy.get('.notification-wrapper__single__cancel')
    .should('be.visible')
    .each(closeButton => cy.wrap(closeButton).click())
})

Cypress.Commands.add('batchActionVerifyNotificationAndClose', () => {
  cy.get('.notification-wrapper__single__title').should('have.text', 'Success!')
  cy.get('.notification-wrapper__single__message')
    .first()
    .should('have.text', 'EPLs successfully updated.')
  cy.get('.notification-wrapper__single__cancel')
    .should('be.visible')
    .each(closeButton => cy.wrap(closeButton).click())
})

Cypress.Commands.add('loginFailWithCredentials', (username, password, external) => {
  cy.get('[name=login]')
    .should('be.visible')
    .type(username)
  cy.get('[name=password]')
    .should('be.visible')
    .type(password)
  cy.get('.button--primary')
    .should('be.visible')
    .click()
  if (external) {
    return cy.get('.sub-header__title').should('not.exist')
  }
  return cy.get('.header .header__profile-image').should('not.exist')
})

Cypress.Commands.add('verifyCategoryNotificationAndClose', () => {
  cy.get('.notification-wrapper__single__title').should('have.text', 'Project requires category')
  cy.get('.notification-wrapper__single__message')
    .first()
    .should('include.text', 'Set the project category in the project details.')
  cy.get('.notification-wrapper__single__cancel')
    .should('be.visible')
    .each(closeButton => cy.wrap(closeButton).click())
})

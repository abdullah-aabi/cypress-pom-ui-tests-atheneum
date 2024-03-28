Cypress.Commands.add('requestLogIn', (username, password) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/login`,
    method: 'POST',
    body: {
      login: username,
      password: password
    }
  }).then(loginResponse => {
    expect(loginResponse.status).to.eq(200)
    return loginResponse
  })
})

Cypress.Commands.add('requestLoginAsEmployee', employeeFullName => {
  cy.requestLogIn(
    Cypress.env('CYPRESS_ADMIN_USERNAME'),
    Cypress.env('CYPRESS_ADMIN_PASSWORD')
  ).then(loginResponse => {
    let authToken = loginResponse.body.token
    cy.requestGetEmployees(authToken, employeeFullName).then(
      employeesResponse => {
        const employeeData = employeesResponse.body.rows.filter(
          employee => employee.fullName === employeeFullName
        )
        cy.requestGetQuickLoginURL(authToken, employeeData[0].id)
      }
    )
  })
})

Cypress.Commands.add('requestLoginAsExpertById', expertId => {
  cy.requestLogIn(
    Cypress.env('CYPRESS_ADMIN_USERNAME'),
    Cypress.env('CYPRESS_ADMIN_PASSWORD')
  ).then(loginResponse => {
    let authToken = loginResponse.body.token
    cy.requestGetQuickLoginURL(authToken, expertId)
  })
})

Cypress.Commands.add('requestExpertPostQuickLogin', quickLoginURL => {
  cy.request({
    url: `${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/api/expert/quick-login`,
    method: 'POST',
    headers: {
      referer: quickLoginURL
    }
  }).then(quickLoginResponse => {
    expect(quickLoginResponse.status).to.eq(200)
    return quickLoginResponse
  })
})

Cypress.Commands.add('requestGetEmployees', (authToken, searchCriteria) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/employee/search`,
    method: 'GET',
    headers: {
      Authorization: authToken
    },
    qs: { employeeStatus: 'active', limit: 10, page: 1, q: searchCriteria }
  }).then(employeesResponse => {
    expect(employeesResponse.status).to.eq(200)
    return employeesResponse
  })
})

Cypress.Commands.add(
  'requestSearchEmployeeByName',
  (authToken, employeeName) => {
    cy.request({
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/employee/search`,
      method: 'GET',
      headers: {
        Authorization: authToken
      },
      qs: { employeeStatus: 'active', limit: 10, page: 1, q: employeeName }
    }).then(employeesResponse => {
      expect(employeesResponse.status).to.eq(200)
      return employeesResponse
    })
  }
)

Cypress.Commands.add('requestGetClientProjectsDraftORPending', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('CAPI_TEST_URL')}/projects`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    qs: { clientName: 'QA Aven Milk Company' }
  }).then(getProjectTypesResponse => {
    expect(getProjectTypesResponse.status).to.eq(200)
    return getProjectTypesResponse
  })
})

Cypress.Commands.add('requestGetClientProjectsOngoing', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('CLIENTS_PLATFORM_APP_URL')}/api/project/client-projects`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
  }).then(getProjectTypesResponse => {
    expect(getProjectTypesResponse.status).to.eq(200)
    return getProjectTypesResponse
  })
})

Cypress.Commands.add('requestGetAPICreatedProjects', (hashValue) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/extern/${hashValue}`,
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(getProjectTypesResponse => {
    expect(getProjectTypesResponse.status).to.eq(200)
    return getProjectTypesResponse
  })
})

Cypress.Commands.add(
  'requestClientCreateProject',
  (authToken, clientCreateProjectData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('CAPI_TEST_URL')}/platform-client-projects`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: clientCreateProjectData
    }).then(createParentAccountResponse => {
      expect(createParentAccountResponse.status).to.eq(200)
      return createParentAccountResponse
    })
  }
)

Cypress.Commands.add(
  'requestSearchClient',
  (authToken, clientEarchData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('SEARCH_SERVICE_URL')}/list-records`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: clientEarchData
    }).then(createParentAccountResponse => {
      expect(createParentAccountResponse.status).to.eq(200)
      return createParentAccountResponse
    })
  }
)

Cypress.Commands.add('requestGetClientProjectsInPlatform', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('CAPI_TEST_URL')}/pending-projects`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    qs: { clientName: '' }
  }).then(getProjectTypesResponse => {
    expect(getProjectTypesResponse.status).to.eq(200)
    return getProjectTypesResponse
  })
})

Cypress.Commands.add('requestEmployeeMultiple', (authToken, employeeData) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/employee/multiple`,
    method: 'POST',
    body: employeeData,
    headers: {
      Authorization: authToken
    }
  }).then(employeeMultipleResponse => {
    expect(employeeMultipleResponse.status).to.eq(200)
    return employeeMultipleResponse
  })
})

Cypress.Commands.add('requestGetQuickLoginURL', (authToken, userID) => {
  cy.request({
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/quick-login-token/${userID}`,
    method: 'GET',
    headers: {
      Authorization: authToken
    }
  }).then(quickLoginResponse => {
    expect(quickLoginResponse.status).to.eq(200)
    return quickLoginResponse
  })
})

Cypress.Commands.add('requestPostQuickLogin', authToken => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/quick-login`,
    method: 'POST',
    body: {
      token: authToken
    },
    headers: {
      Authorization: authToken
    }
  }).then(quickLoginResponse => {
    expect(quickLoginResponse.status).to.eq(200)
    return quickLoginResponse
  })
})

Cypress.Commands.add(
  'requestCreateParentAccount',
  (authToken, parentAccountData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/parent-account`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: parentAccountData
    }).then(createParentAccountResponse => {
      expect(createParentAccountResponse.status).to.eq(200)
      return createParentAccountResponse
    })
  }
)

Cypress.Commands.add('requestPostRecords', (authToken, clientRecordsData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('SEARCH_SERVICE_URL')}/list-records`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: clientRecordsData
  }).then(searchRecordsResponse => {
    expect(searchRecordsResponse.status).to.eq(200)
    return searchRecordsResponse
  })
})

Cypress.Commands.add(
  'requestDeleteParentAccount',
  (authToken, parentAccountId) => {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/parent-account/${parentAccountId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(deleteParentAccountResponse => {
      expect(deleteParentAccountResponse.status).to.eq(200)
      return deleteParentAccountResponse
    })
  }
)

Cypress.Commands.add('requestCreateAccount', (authToken, accountData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/account`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken,
      utcOffset: 2
    },
    body: accountData
  }).then(createAccountResponse => {
    expect(createAccountResponse.status).to.eq(200)
    return createAccountResponse
  })
})

Cypress.Commands.add('requestCreateOffice', (authToken, officeData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/office`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: officeData
  }).then(createOfficeResponse => {
    expect(createOfficeResponse.status).to.eq(200)
    return createOfficeResponse
  })
})

Cypress.Commands.add('requestCreateContract', (authToken, createContractAPI) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/contract`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: createContractAPI
  }).then(createContractAPIResponse => {
    expect(createContractAPIResponse.status).to.eq(200)
    return createContractAPIResponse
  })
})

Cypress.Commands.add('requestGetOffices', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/office`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getOfficesResponse => {
    expect(getOfficesResponse.status).to.eq(200)
    return getOfficesResponse
  })
})

Cypress.Commands.add('requestGetOfficeById', (authToken, officeId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/office/${officeId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getOfficeResponse => {
    expect(getOfficeResponse.status).to.eq(200)
    return getOfficeResponse
  })
})

Cypress.Commands.add('requestGetIndustries', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/industry`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getIndustriesResponse => {
    expect(getIndustriesResponse.status).to.eq(200)
    return getIndustriesResponse
  })
})

Cypress.Commands.add('requestGetProjectTypes', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project-type`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getProjectTypesResponse => {
    expect(getProjectTypesResponse.status).to.eq(200)
    return getProjectTypesResponse
  })
})


Cypress.Commands.add('requestGetStaticData', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/static-data`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getStaticDataResponse => {
    expect(getStaticDataResponse.status).to.eq(200)
    return getStaticDataResponse
  })
})

Cypress.Commands.add('requestCreateClient', (authToken, clientData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/client`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: clientData
  }).then(createClientResponse => {
    expect(createClientResponse.status).to.eq(200)
    return createClientResponse
  })
})

Cypress.Commands.add('requestSearchClientContacts', (authToken, clientData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/client-search-new`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: clientData
  }).then(clientResponse => {
    expect(clientResponse.status).to.eq(200)
    return clientResponse
  })
})

Cypress.Commands.add('requestCreateEmployee', (authToken, employeeData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/employee`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: employeeData
  }).then(createEmployeeResponse => {
    expect(createEmployeeResponse.status).to.eq(200)
    return createEmployeeResponse
  })
})

Cypress.Commands.add('requestCreateTeam', (authToken, teamCreateData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/team`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: teamCreateData
  }).then(createTeamResponse => {
    expect(createTeamResponse.status).to.eq(200)
    return createTeamResponse
  })
})

Cypress.Commands.add('requestGetTeam', authToken => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/team/active`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getTeamResponse => {
    expect(getTeamResponse.status).to.eq(200)
    return getTeamResponse
  })
})

Cypress.Commands.add('requestGetTeamEmployees', (authToken, year, month) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/team/employees/${year}/${month}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getTeamEmployeeResponse => {
    expect(getTeamEmployeeResponse.status).to.eq(200)
    return getTeamEmployeeResponse
  })
})

Cypress.Commands.add(
  'requestAssignTeamEmployee',
  (authToken, assignTeamEmployeeData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/team/assign-employee`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: assignTeamEmployeeData
    }).then(assignTeamEmployee => {
      expect(assignTeamEmployee.status).to.eq(200)
      return assignTeamEmployee
    })
  }
)

Cypress.Commands.add('requestGetExpertById', (authToken, expertId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/${expertId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getExpertResponse => {
    expect(getExpertResponse.status).to.eq(200)
    return getExpertResponse
  })
})

Cypress.Commands.add('requestCreateExpert', (authToken, expertData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: expertData
  }).then(createExpertResponse => {
    expect(createExpertResponse.status).to.eq(200)
    return createExpertResponse
  })
})

Cypress.Commands.add('requestDeleteExpertById', (authToken, expertId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert/${expertId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(deleteExpertResponse => {
    expect(deleteExpertResponse.status).to.eq(200)
    return deleteExpertResponse
  })
})

Cypress.Commands.add('requestDeleteEPLById', (authToken, expertId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-project-link/${expertId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(deleteEPLResponse => {
    expect(deleteEPLResponse.status).to.eq(200)
    return deleteEPLResponse
  })
})

Cypress.Commands.add(
  'requestExpertCreateBasicProfile',
  (expertToken, expertId, body) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'EXPERTS_PLATFORM_APP_URL'
      )}/api/expert/${expertId}/create-basic-profile`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: expertToken
      },
      body
    }).then(createBasicProfileResponse => {
      expect(createBasicProfileResponse.status).to.eq(200)
      return createBasicProfileResponse
    })
  }
)

Cypress.Commands.add(
  'requestExpertSetStatus',
  (authToken, expertId, expertStatusData) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/expert/${expertId}/expert-status`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: expertStatusData
    }).then(setStatusResponse => {
      expect(setStatusResponse.status).to.eq(200)
      return setStatusResponse
    })
  }
)

Cypress.Commands.add('requestExpertAcceptCompliance', authToken => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('EXPERTS_PLATFORM_APP_URL')}/api/expert/compliance`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(expertAcceptComplianceResponse => {
    expect(expertAcceptComplianceResponse.status).to.eq(200)
    return expertAcceptComplianceResponse
  })
})

Cypress.Commands.add(
  'requestExpertDisagreeCompliance',
  (authToken, expertData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env(
        'EXPERTS_PLATFORM_APP_URL'
      )}/api/expert/compliance/disagree`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: expertData
    }).then(expertDiasgreeComplianceResponse => {
      expect(expertDiasgreeComplianceResponse.status).to.eq(200)
      return expertDiasgreeComplianceResponse
    })
  }
)

Cypress.Commands.add('requestExpertGetProjectLink', (authToken, projectId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'EXPERTS_PLATFORM_APP_URL'
    )}/api/expert-project-link/${projectId}/expert`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(expertProjectLinkResponse => {
    expect(expertProjectLinkResponse.status).to.eq(200)
    return expertProjectLinkResponse
  })
})

Cypress.Commands.add(
  'requestGetExpertAvailableConsultations',
  (authToken, expertId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env(
        'EXPERTS_PLATFORM_APP_URL'
      )}/api/expert/${expertId}/available-consultations`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(GetExpertAvailableConsultationsResponse => {
      expect(GetExpertAvailableConsultationsResponse.status).to.eq(200)
      return GetExpertAvailableConsultationsResponse
    })
  }
)

Cypress.Commands.add(
  'requestExpertProjectLinkApply',
  (authToken, segmentId, eplData) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'EXPERTS_PLATFORM_APP_URL'
      )}/api/expert-project-link/${segmentId}/apply`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: eplData
    }).then(expertProjectLinkApplyResponse => {
      expect(expertProjectLinkApplyResponse.status).to.eq(200)
      return expertProjectLinkApplyResponse
    })
  }
)

Cypress.Commands.add(
  'requestExpertDeclineApplication',
  (authToken, segmentId, responseData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env(
        'EXPERTS_PLATFORM_APP_URL'
      )}/api/expert-project-link/${segmentId}/decline-application`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: responseData
    }).then(expertDeclineApplicationResponse => {
      expect(expertDeclineApplicationResponse.status).to.eq(200)
      return expertDeclineApplicationResponse
    })
  }
)

Cypress.Commands.add('requestCreateProject', (authToken, projectData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: projectData
  }).then(createProjectResponse => {
    expect(createProjectResponse.status).to.eq(200)
    return createProjectResponse
  })
})

Cypress.Commands.add('requestGetProjectById', (authToken, projectId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${projectId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getProjectResponse => {
    expect(getProjectResponse.status).to.eq(200)
    return getProjectResponse
  })
})

Cypress.Commands.add('requestDeleteProject', (authToken, projectId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/project/${projectId}?deletePulse=false`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(deleteProjectResponse => {
    expect(deleteProjectResponse.status).to.eq(200)
    return deleteProjectResponse
  })
})

Cypress.Commands.add(
  'requestPostProjectPipeline',
  (authToken, projectId, pipelineDate) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/project/${projectId}/pipeline`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: pipelineDate
    }).then(postProjectPipelineResponse => {
      expect(postProjectPipelineResponse.status).to.eq(200)
      return postProjectPipelineResponse
    })
  }
)

Cypress.Commands.add(
  'requestGetProjectDeliverables',
  (authToken, projectId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/project/${projectId}/deliverables`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(getProjectDeliverablesResponse => {
      expect(getProjectDeliverablesResponse.status).to.eq(200)
      return getProjectDeliverablesResponse
    })
  }
)

Cypress.Commands.add('requestDeleteFee', (authToken, feeId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/fee/${feeId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(deleteFeeResponse => {
    expect(deleteFeeResponse.status).to.eq(200)
    return deleteFeeResponse
  })
})

Cypress.Commands.add('requestGetProjectSegments', (authToken, projectId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/segment/project/${projectId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getProjectSegmentsResponse => {
    expect(getProjectSegmentsResponse.status).to.eq(200)
    return getProjectSegmentsResponse
  })
})

Cypress.Commands.add(
  'requestCreateProjectSegment',
  (authToken, segmentId, segmentData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/segment/${segmentId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: segmentData
    }).then(createProjectSegmentResponse => {
      expect(createProjectSegmentResponse.status).to.eq(200)
      return createProjectSegmentResponse
    })
  }
)

Cypress.Commands.add('requestGetEPL', (authToken, eplId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/${eplId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getEPLResponse => {
    expect(getEPLResponse.status).to.eq(200)
    return getEPLResponse
  })
})

Cypress.Commands.add('requestPutEPL', (authToken, eplId, eplRequestData) => {
  cy.request({
    method: 'PUT',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/${eplId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: eplRequestData
  }).then(putEPLResponse => {
    expect(putEPLResponse.status).to.eq(200)
    return putEPLResponse
  })
})

Cypress.Commands.add('requestPutEPLExpanded', (authToken, eplId, eplRequestData) => {
  cy.request({
    method: 'PUT',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/${eplId}/expanded`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: eplRequestData
  }).then(putEPLExpandedResponse => {
    expect(putEPLExpandedResponse.status).to.eq(200)
    return putEPLExpandedResponse
  })
})

Cypress.Commands.add('requestPutEPLDeliveredBy', (authToken, eplId, userID) => {
  cy.request({
    method: 'PUT',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/${eplId}/delivered-by`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: { deliveredBy: userID }
  }).then(putEPLDeliveredByResponse => {
    expect(putEPLDeliveredByResponse.status).to.eq(200)
    return putEPLDeliveredByResponse
  })
})

Cypress.Commands.add('requestPutEPLv2', (authToken, eplId, eplRequestData) => {
  cy.request({
    method: 'PUT',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/${eplId}/v2`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: eplRequestData
  }).then(putEPLResponse => {
    expect(putEPLResponse.status).to.eq(200)
    return putEPLResponse
  })
})

Cypress.Commands.add('requestEPLBulkValidate', (authToken, eplRequestData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/bulk-validate`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: eplRequestData
  }).then(EPLBulkValidateResponse => {
    expect(EPLBulkValidateResponse.status).to.eq(200)
    return EPLBulkValidateResponse
  })
})

Cypress.Commands.add('requestEPLBulkCreate', (authToken, eplRequestData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/bulk-create`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: eplRequestData
  }).then(EPLBulkCreateResponse => {
    expect(EPLBulkCreateResponse.status).to.eq(200)
    return EPLBulkCreateResponse
  })
})

Cypress.Commands.add('requestPostFee', (authToken, feeBody) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/fee`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: feeBody
  }).then(postFeeResponse => {
    expect(postFeeResponse.status).to.eq(200)
    return postFeeResponse
  })
})

//if true, the Search will enable and return PDL experts 
Cypress.Commands.add(
  'requestSearchExperts',
  (authToken, expertSearchRequest, toggle = false) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('SEARCH_SERVICE_URL')}/expert?switch=${toggle}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: expertSearchRequest
    }).then(expertsResponse => {
      expect(expertsResponse.status).to.eq(200)
      return expertsResponse
    })
  }
)

Cypress.Commands.add(
  'requestTakenSlots',
  (authToken, expertId, start, end, epl) => {
    cy.request({
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/expert-availability-to-epl/${expertId}/taken-slots`,
      method: 'GET',
      headers: {
        Authorization: authToken
      },
      qs: { startTime: start, endTime: end, eplId: epl }
    }).then(takenSlotsResponse => {
      expect(takenSlotsResponse.status).to.eq(200)
      return takenSlotsResponse
    })
  }
)

Cypress.Commands.add('requestGetEPLRequestSchedule', (authToken, eplId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/expert-project-link/${eplId}/request-schedule`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getEPLRequestScheduleResponse => {
    expect(getEPLRequestScheduleResponse.status).to.eq(200)
    return getEPLRequestScheduleResponse
  })
})

Cypress.Commands.add(
  'requestGetExpertAvailabilityToEPL',
  (authToken, eplId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/expert-availability-to-epl/fetch/${eplId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(getExpertAvailabilityToEPLResponse => {
      expect(getExpertAvailabilityToEPLResponse.status).to.eq(200)
      return getExpertAvailabilityToEPLResponse
    })
  }
)

Cypress.Commands.add(
  'requestGetClientToProjectAvailability',
  (authToken, projectId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/client-to-project-availability/fetch/${projectId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(getClientToProjectAvailabilityResponse => {
      expect(getClientToProjectAvailabilityResponse.status).to.eq(200)
      return getClientToProjectAvailabilityResponse
    })
  }
)

Cypress.Commands.add(
  'requestCreateAvailabilityAndTimeslot',
  (authToken, availabilityAndScheduleData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('CALENDAR_SERVICE_URL')}/schedule`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: availabilityAndScheduleData
    }).then(createAvailabilityAndTimeslotResponse => {
      expect(createAvailabilityAndTimeslotResponse.status).to.eq(200)
      return createAvailabilityAndTimeslotResponse
    })
  }
)

Cypress.Commands.add('requestGetCurrencyRates', (authToken, month) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/currency-rates?month=${month}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(currencyRatesResponse => {
    expect(currencyRatesResponse.status).to.eq(200)
    return currencyRatesResponse
  })
})

Cypress.Commands.add(
  'requestZoomMeeting',
  (authToken, scheduleId, zoomMeetingData) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/schedule/${scheduleId}/zoom-meeting`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: zoomMeetingData
    }).then(setZoomMeetingResponse => {
      expect(setZoomMeetingResponse.status).to.eq(200)
      return setZoomMeetingResponse
    })
  }
)

Cypress.Commands.add(
  'requestRemoveAvailabilities',
  (authToken, eplId, availabilitiesToRemove) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/expert-project-link/${eplId}/schedule`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: availabilitiesToRemove
    }).then(removeAvailabilitiesResponse => {
      expect(removeAvailabilitiesResponse.status).to.eq(200)
      return removeAvailabilitiesResponse
    })
  }
)

Cypress.Commands.add('addTargetMargin', (authToken, marginData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/team/target-margin`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: marginData
  }).then(addTargetMarginResponse => {
    expect(addTargetMarginResponse.status).to.eq(200)
    return addTargetMarginResponse
  })
})

Cypress.Commands.add(
  'requestSearchAccountRecords',
  (authToken, accountSearchData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('SEARCH_SERVICE_URL')}/list-records`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: accountSearchData
    }).then(accountSearchResponse => {
      expect(accountSearchResponse.status).to.eq(200)
      return accountSearchResponse
    })
  }
)

Cypress.Commands.add('requestSearchProject', (authToken, projectSearchData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('SEARCH_SERVICE_URL')}/project`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: projectSearchData
  }).then(projectSearchResponse => {
    expect(projectSearchResponse.status).to.eq(200)
    return projectSearchResponse
  })
})

Cypress.Commands.add('requestQuickSearch', (authToken, searchItem) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('SEARCH_SERVICE_URL')}/menu?q=${searchItem}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(quickSearchResponse => {
    expect(quickSearchResponse.status).to.eq(200)
    return quickSearchResponse
  })
})

Cypress.Commands.add('requestGetTeamRevenueWidgetData', (authToken, currentMonthYear) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/team-revenue-widget-data`,
    method: 'GET',
    headers: {
      Authorization: authToken
    },
    qs: { month: currentMonthYear }
  }).then(teamRevenueWidgetResponse => {
    expect(teamRevenueWidgetResponse.status).to.eq(200)
    return teamRevenueWidgetResponse
  })
})

Cypress.Commands.add('requestGetPerformanceWidgetData', (authToken, currentMonthYear) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/performance-widget-data`,
    method: 'GET',
    headers: {
      Authorization: authToken
    },
    qs: { month: currentMonthYear }
  }).then(getPerformanceWidgetResponse => {
    expect(getPerformanceWidgetResponse.status).to.eq(200)
    return getPerformanceWidgetResponse
  })
})

Cypress.Commands.add('requestGetAccountRevenueMonthlyWidgetData', (authToken, currentMonthYear) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/account-revenue-widget-data`,
    method: 'GET',
    headers: {
      Authorization: authToken
    },
    qs: { month: currentMonthYear }
  }).then(getAccountRevenueMonthlyWidgetResponse => {
    expect(getAccountRevenueMonthlyWidgetResponse.status).to.eq(200)
    return getAccountRevenueMonthlyWidgetResponse
  })
})

Cypress.Commands.add('requestGetAccountRevenueQuarterlyWidgetData', (authToken, currentYear, CurrentQuarter) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/account-revenue-quarterly-widget-data`,
    method: 'GET',
    headers: {
      Authorization: authToken
    },
    qs: { year: currentYear, quarter: CurrentQuarter }
  }).then(getAccountRevenueQuarterlyWidgetResponse => {
    expect(getAccountRevenueQuarterlyWidgetResponse.status).to.eq(200)
    return getAccountRevenueQuarterlyWidgetResponse
  })
})

Cypress.Commands.add('requestGetHonorariaWidgetData', (authToken, currentMonthYear) => {
  cy.request({
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/honoraria-analysis-widget-data`,
    method: 'GET',
    headers: {
      Authorization: authToken
    },
    qs: { month: currentMonthYear }
  }).then(getHonorariaWidgetResponse => {
    expect(getHonorariaWidgetResponse.status).to.eq(200)
    return getHonorariaWidgetResponse
  })
})

Cypress.Commands.add(
  'requestGetAtheneumContact',
  (authToken) => {
    cy.request({
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/employee/by-position`,
      method: 'GET',
      headers: {
        Authorization: authToken
      },
      qs: { employeePosition: 5 }
    }).then(getAtheneumContactResponse => {
      expect(getAtheneumContactResponse.status).to.eq(200)
      return getAtheneumContactResponse
    })
  }
)

Cypress.Commands.add(
  'requestGetEPLSubmitCron',
  (authToken) => {
    cy.request({
      url: `${Cypress.env(
        'EXPERT_SERVICE_URL'
      )}/integration/api/expert/update-status`,
      method: 'GET',
      headers: {
        Authorization: authToken
      }
    }).then(cronRespone => {
      expect(cronRespone.status).to.eq(200)
      return cronRespone
    })
  }
)

Cypress.Commands.add(
  'requestClientsLogin',
  (username, password) => {
    cy.request({
      url: `${Cypress.env(
        'CLIENTS_PLATFORM_APP_URL'
      )}/api/client/login`,
      method: 'POST',
      body: { "login": username, "password": password, "remember": false }
    }).then(clientsLoginResponse => {
      expect(clientsLoginResponse.status).to.eq(200)
      return clientsLoginResponse
    })
  }
)

Cypress.Commands.add(
  'requestClientsGetProjectExternLink',
  (authToken, projectId) => {
    cy.request({
      url: `${Cypress.env(
        'CLIENTS_PLATFORM_APP_URL'
      )}/api/project/${projectId}/extern-link`,
      method: 'POST',
      headers: {
        Authorization: authToken
      }
    }).then(clientsProjectLink => {
      expect(clientsProjectLink.status).to.eq(200)
      return clientsProjectLink
    })
  }
)

Cypress.Commands.add(
  'requestClientsGetProjectLink',
  (authToken, projectId) => {
    cy.request({
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/project/${projectId}/extern-link`,
      method: 'POST',
      headers: {
        Authorization: authToken
      }
    }).then(clientsProjectLink => {
      expect(clientsProjectLink.status).to.eq(200)
      return clientsProjectLink
    })
  }
)

Cypress.Commands.add('requestGetProjectDeliverablesForPAYG', (authToken, projectId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/project/${projectId}/deliverables?paygOnly=true`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(getProjectDeliverablesForPAYGResponse => {
    expect(getProjectDeliverablesForPAYGResponse.status).to.eq(200)
    return getProjectDeliverablesForPAYGResponse
  })
})

Cypress.Commands.add('requestGetInvoiceEntity', (authToken, parentAccountId, accountId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/invoicing-entity/parent-account/${parentAccountId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    qs: { accountId: accountId }
  }).then(getInvoiceEntityResponse => {
    expect(getInvoiceEntityResponse.status).to.eq(200)
    return getInvoiceEntityResponse
  })
})

Cypress.Commands.add('requestInvoiceDraft', (authToken, invoiceCreateData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/invoice`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: invoiceCreateData
  }).then(invoiceCreateResponse => {
    expect(invoiceCreateResponse.status).to.eq(200)
    return invoiceCreateResponse
  })
})

Cypress.Commands.add('requestInvoiceSearchData', (authToken, invoiceSearchData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/invoice/invoice-listing`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: invoiceSearchData
  }).then(invoiceSearchDataResponse => {
    expect(invoiceSearchDataResponse.status).to.eq(200)
    return invoiceSearchDataResponse
  })
})

Cypress.Commands.add(
  'requestInvoiceApproval', (authToken, invoiceId) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/invoice/${invoiceId}/request-approval`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(setComplianceResponse => {
      expect(setComplianceResponse.status).to.eq(200)
      return setComplianceResponse
    })
  }
)

Cypress.Commands.add(
  'requestInvoiceApproved', (authToken, invoiceId) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/invoice/${invoiceId}/approve`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(setComplianceResponse => {
      expect(setComplianceResponse.status).to.eq(200)
      return setComplianceResponse
    })
  }
)

Cypress.Commands.add(
  'requestInvoiceCreated', (authToken, invoiceId, invoiceCreateData) => {
    cy.request({
      method: 'PUT',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/invoice/${invoiceId}/created-status`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: invoiceCreateData
    }).then(setComplianceResponse => {
      expect(setComplianceResponse.status).to.eq(200)
      return setComplianceResponse
    })
  }
)

Cypress.Commands.add(
  'requestGetInvoiceData', (authToken, invoiceId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/invoice/${invoiceId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(getInvoiceDataResponse => {
      expect(getInvoiceDataResponse.status).to.eq(200)
      return getInvoiceDataResponse
    })
  }
)

Cypress.Commands.add(
  'requestSendInvoiceData', (authToken, invoiceId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env(
        'LEGACY_PLATFORM_APP_URL'
      )}/api/invoice/${invoiceId}/send-invoice`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      qs: { templateName: 'send_invoice' }
    }).then(sendInvoiceDataResponse => {
      expect(sendInvoiceDataResponse.status).to.eq(200)
      return sendInvoiceDataResponse
    })
  }
)

Cypress.Commands.add('sendInvoice', (authToken, invoiceId, sendinvoiceData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/invoice/${invoiceId}/send-invoice`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: sendinvoiceData
  }).then(sendInvoiceResponse => {
    expect(sendInvoiceResponse.status).to.eq(200)
    return sendInvoiceResponse
  })
})

Cypress.Commands.add('requestInvoicePayments', (authToken, invoiceId, invoicePaymentsData) => {
  cy.request({
    method: 'PUT',
    url: `${Cypress.env(
      'LEGACY_PLATFORM_APP_URL'
    )}/api/invoice/${invoiceId}/invoice-payments`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: invoicePaymentsData
  }).then(sendInvoiceResponse => {
    expect(sendInvoiceResponse.status).to.eq(200)
    return sendInvoiceResponse
  })
})

Cypress.Commands.add('requestGetRevenuesReport',
  (authToken, monthYear, atheneumOffice, projectType, clientAccountType, projectId) => {
    cy.request({
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/revenues-report`,
      method: 'GET',
      headers: {
        Authorization: authToken
      },
      qs: { date: monthYear, apOffice: atheneumOffice, projectType: projectType, accountType: clientAccountType, project: projectId }
    }).then(revenuesReportResponse => {
      expect(revenuesReportResponse.status).to.eq(200)
      return revenuesReportResponse
    })
  })

Cypress.Commands.add('requestGetPerformanceReport',
  (authToken, monthYear, employeeId) => {
    cy.request({
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/performance`,
      method: 'GET',
      headers: {
        Authorization: authToken
      },
      qs: { month: monthYear, employeeId: employeeId }
    }).then(performanceReportResponse => {
      expect(performanceReportResponse.status).to.eq(200)
      return performanceReportResponse
    })
  })

Cypress.Commands.add(
  'requestPaymentReports',
  (authToken, startDate, endDate) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/payment`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: { "startDate": startDate, "endDate": endDate }
    }).then(paymentReportsResponse => {
      expect(paymentReportsResponse.status).to.eq(200)
      return paymentReportsResponse
    })
  }
)

Cypress.Commands.add('requestGetFinancialRevenue',
  (authToken, startDate, endDate, parentAccountId, accountId, contractTypeId, entryTypes) => {
    cy.request({
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/financial-revenue`,
      method: 'GET',
      headers: {
        Authorization: authToken
      },
      qs: { fromDate: startDate, limit: 20, page: 1, toDate: endDate, parentAccountId: parentAccountId, accountId: accountId, contractTypeIds: contractTypeId, entryTypes: entryTypes }
    }).then(financialRevenueResponse => {
      expect(financialRevenueResponse.status).to.eq(200)
      return financialRevenueResponse
    })
  })


Cypress.Commands.add(
  'requestGeneralFeesReports',
  (authToken, generalFeesData) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/report/general-fees`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: generalFeesData,
    }).then(generalFeesReportsResponse => {
      expect(generalFeesReportsResponse.status).to.eq(200)
      return generalFeesReportsResponse
    })
  }
)

Cypress.Commands.add('createExpertAthenaList', (authToken, expertListData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'REACT_APP_MASS_PROCESSOR_URL'
    )}/list`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: expertListData
  }).then(expertListResponse => {
    expect(expertListResponse.status).to.eq(200)
    return expertListResponse
  })
}
)

Cypress.Commands.add('getExpertAthenaListByType', (authToken, typeOfList) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'REACT_APP_MASS_PROCESSOR_URL'
    )}/list`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    qs: { type: typeOfList }
  }).then(expertListResponse => {
    expect(expertListResponse.status).to.eq(200)
    return expertListResponse
  })
}
)

Cypress.Commands.add('getExpertAthenaListById', (authToken, listId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'REACT_APP_MASS_PROCESSOR_URL'
    )}/list/${listId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
  }).then(expertListResponse => {
    expect(expertListResponse.status).to.eq(200)
    return expertListResponse
  })
}
)

Cypress.Commands.add(
  'requestDeleteItemInAthenaList', (authToken, itemId) => {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('REACT_APP_MASS_PROCESSOR_URL')}/item/${itemId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(deleteItemInAthenaListResponse => {
      expect(deleteItemInAthenaListResponse.status).to.eq(200)
      return deleteItemInAthenaListResponse
    })
  }
)

Cypress.Commands.add(
  'requestDeleteListInAthenaList', (authToken, listId) => {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('REACT_APP_MASS_PROCESSOR_URL')}/list/${listId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(deleteListInAthenaListResponse => {
      expect(deleteListInAthenaListResponse.status).to.eq(200)
      return deleteListInAthenaListResponse
    })
  }
)

Cypress.Commands.add(
  'requestGetClientToProjectAvailability', (authToken, projectId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/client-to-project-availability/fetch/${projectId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(clientToProjectAvailabilityResponse => {
      expect(clientToProjectAvailabilityResponse.status).to.eq(200)
      return clientToProjectAvailabilityResponse
    })
  }
)

Cypress.Commands.add(
  'requestGetExpertToEPLAvailability', (authToken, eplId) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/expert-availability-to-epl/fetch/${eplId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      }
    }).then(expertToEPLAvailabilityResponse => {
      expect(expertToEPLAvailabilityResponse.status).to.eq(200)
      return expertToEPLAvailabilityResponse
    })
  }
)

Cypress.Commands.add('requestProjectPipeline', (authToken, atheneumContact, atheneumOffice) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env(
      'EXPERTS_PLATFORM_APP_URL'
    )}/api/project/projects-pipeline?atheneumContact=${atheneumContact}&atheneumOffice=${atheneumOffice}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(projectPipelijeResponse => {
    expect(projectPipelijeResponse.status).to.eq(200)
    return projectPipelijeResponse
  })
})

Cypress.Commands.add(
  'requestParentAccountContractSearch',
  (authToken, parentAccountId) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/contract/search`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: { "page": 1, "contractStatuses": [2, 3], "searchString": "", "contractTypeId": 0, "parentAccountId": parentAccountId, "limit": 15 },
    }).then(ContractsResponse => {
      expect(ContractsResponse.status).to.eq(200)
      return ContractsResponse
    })
  }
)

Cypress.Commands.add(
  'requestDeleteContractById',
  (authToken, contractId) => {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/contract/${contractId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
    }).then(contractDeleteResponse => {
      expect(contractDeleteResponse.status).to.eq(200)
      return contractDeleteResponse
    })
  }
)

Cypress.Commands.add('requestFeedbackLink', (authToken, Id) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${Id}/client-feedback`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(clientFeedbackResponse => {
    expect(clientFeedbackResponse.status).to.eq(200)
    return `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/p/${clientFeedbackResponse.body[0].hash}/feedback`
  })
})

Cypress.Commands.add('changeProjectStatusRequest', (authToken, projectId, commentBody) => {

  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${projectId}/change-status`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken,
      'utcoffset': 3
    },
    body: commentBody
  }).then(postProjectPipelineResponse => {
    expect(postProjectPipelineResponse.status).to.eq(200)
    return postProjectPipelineResponse
  })
})

Cypress.Commands.add('requestCopyLink', (authToken, projectId) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${projectId}/extern-links`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken,
      'utcoffset': 5
    }
  }).then(externalLinkApiResponse => {
    expect(externalLinkApiResponse.status).to.eq(200)
    return externalLinkApiResponse.body[0].path
  })
})

Cypress.Commands.add('requestClientContacts', (authToken, projectId) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${projectId}/clients`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  }).then(clientContactsResponse => {
    expect(clientContactsResponse.status).to.eq(200)
    return clientContactsResponse
  })
})

Cypress.Commands.add('requestDeliverableApi', (authToken, projectId, deliverableType) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('LEGACY_PLATFORM_APP_URL')}/api/project/${projectId}/deliverables`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken,
      utcoffset: 5
    }
  }).then(getDeliverablesResponse => {
    expect(getDeliverablesResponse.status).to.eq(200)
    expect(getDeliverablesResponse.body[0].name).to.contain(deliverableType)
  })
})

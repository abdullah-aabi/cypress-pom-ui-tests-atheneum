Cypress.Commands.add(
    'requestPostMckinseyProject',
    (requestBody) => {
        cy.request({
            url: `${Cypress.env('MOCK_CAPI_URL')}/webhook/projects`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('MOCK_CAPI_AUTH')
            },
            body: requestBody
        }).then(postMckinseyProjectResponse => {
            expect(postMckinseyProjectResponse.status).to.eq(200)
            return postMckinseyProjectResponse
        })
    }
)

Cypress.Commands.add(
    'requestPostMckinseyChatMessage',
    (requestBody) => {
        cy.request({
            url: `${Cypress.env('MOCK_CAPI_URL')}/webhook/chatMessages`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('MOCK_CAPI_AUTH')
            },
            body: requestBody
        }).then(postMckinseyChatMessagesResponse => {
            expect(postMckinseyChatMessagesResponse.status).to.eq(200)
            return postMckinseyChatMessagesResponse
        })
    }
)

Cypress.Commands.add(
    'requestPostMckinseyWorksteam',
    (requestBody) => {
        cy.request({
            url: `${Cypress.env('MOCK_CAPI_URL')}/webhook/workstreams`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('MOCK_CAPI_AUTH')
            },
            body: requestBody
        }).then(postMckinseyWorksteamsResponse => {
            expect(postMckinseyWorksteamsResponse.status).to.eq(200)
            return postMckinseyWorksteamsResponse
        })
    }
)

Cypress.Commands.add(
    'requestPostMckinseyCall',
    (requestBody) => {
        cy.request({
            url: `${Cypress.env('MOCK_CAPI_URL')}/webhook/calls`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('MOCK_CAPI_AUTH')
            },
            body: requestBody
        }).then(postMckinseyCallsResponse => {
            expect(postMckinseyCallsResponse.status).to.eq(200)
            return postMckinseyCallsResponse
        })
    }
)

Cypress.Commands.add(
    'requestPostMckinseyExperts',
    (requestBody) => {
        cy.request({
            url: `${Cypress.env('MOCK_CAPI_URL')}/webhook/experts`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Cypress.env('MOCK_CAPI_AUTH')
            },
            body: requestBody
        }).then(postMckinseyExpertsResponse => {
            expect(postMckinseyExpertsResponse.status).to.eq(200)
            return postMckinseyExpertsResponse
        })
    }
)


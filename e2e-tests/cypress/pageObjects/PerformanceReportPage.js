class PerformanceReportPage {
    
    getSelectEmployeeField () {
        return cy.get('.filter-input  input').first()
          .should('be.visible')
      }

      selectEmployee (employeeName) {
        this.getSelectEmployeeField().click()
        this.getAutoComplete().each($el => {
            if ($el.text().includes(employeeName)) {
              cy.wrap($el).click()
            }
          })
    }

    getPerformanceReportResults () {
        return cy.get('.performance-report-table tbody tr').should('be.visible')
      }

    getAutoComplete () {
        return cy.get('.autocomplete__results-container div').should('exist')
      }

      getEmployeeName () {
        return cy.get(':nth-child(1) > .text-wrapper').should('be.visible')
      }

      getAccountManagerName () {
          return cy.get(':nth-child(3) > .text-wrapper').should('be.visible')
      }

      getExpertName () {
          return cy.get(':nth-child(5) > .text-wrapper').should('be.visible')
      }

      getFeeType () {
          return cy.get(':nth-child(6) > .text-wrapper').should('be.visible')
      }

      getProjectName () {
          return cy.get('tbody :nth-child(2) > .row--link').should('be.visible')
      }

      getTotalFee () {
        return cy.get('.totals :nth-child(7) .table-number').should('be.visible')
    }

    getTotalCost () {
        return cy.get('.totals :nth-child(8) .table-number').should('be.visible')
    }

    getTotalMargin () {
        return cy.get('.totals :nth-child(9) .table-number').should('be.visible')
    }

    getProjectNameOnSideBar () {
        return cy.get('h1 a').should('be.visible')
    }
      
  }
  
  export default PerformanceReportPage


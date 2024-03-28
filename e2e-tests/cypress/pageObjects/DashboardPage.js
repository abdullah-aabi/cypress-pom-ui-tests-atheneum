class DashboardPage {
    getTeamMembersCountInTeamRevenue () {
      return cy.get('.team-list .teamRevenue-table-row')
    }
    getTeamNameInTeamRevenue () {
        return cy.get('.desktop-teamRevenue .dashboard-link.active')
    }
    getAccountManagernameInTeamRevenue () {
        return cy.get('.dashboard-wrapper__team-revenue .account-manager div')
    }

    getTeamRevenueSection(){
        return cy.get('.dashboard-wrapper__team-revenue').should('be.visible')
    }
   
    getMobileTeamRevenue(){
        return cy.get('.mobile-teamRevenue').should('be.visible')
    }

    getColumnInTeamRevenue (row, column) {
       return cy.get(`.dashboard-wrapper__team-revenue .team-list .teamRevenue-table-row:nth-child(${row}) .teamRevenue-table-cell:nth-child(${column})`).scrollIntoView()
    }

    getTotalColumnInTeamRevenue (column) {
       return cy.get(`.teamRevenue-widget .bottom-total-row div:nth-child(${column})`)
    }

    getTotalCountOfSubTeams () {
       return cy.get('.desktop-teamRevenue .dashboard-links div.slick-slide')
    }

    getASubTeam (index) {
        return cy.get(`.desktop-teamRevenue .dashboard-links div[data-index="${index}"]`)
    }

    getClolumnInSubTeam (row, column) {
       return cy.get(`.dashboard-wrapper__team-revenue .team-list .teamRevenue-table-row:nth-child(${row}) .teamRevenue-table-cell:nth-child(${column})`)
    }

    getTeamNameInPerformanceWidget () {
        return cy.get('.performance-widget tbody tr:nth-child(2) span span')
    }

    getTeamDvInPerformanceWidget (column) {
        return cy.get(`.performance-widget .widget-table tbody tr.performance-row:nth-child(2) td:nth-child(${column})`)
    }

    getDelieveredByMeDvs (column) {
        return cy.get(`.widget-table > :nth-child(2) > :nth-child(${column})`)
    }

    getTotalDvs (column) {
        return cy.get(`.performance-widget .widget-table tbody tr.performance-row:nth-child(1) td:nth-child(${column})`)
    }

    getTotalCountOfEmployeeInHonoWidget () {
        return cy.get('.desktop-honorariaAnalysis .team-list .honorariaAnalysis-table-row')
    }

    getTeamNameInHonoWidget () {
        return cy.get('.honorariaAnalysis-widget .team-name-manager-section div')
    }

    getColmnInHonoWidget (row, column) {
        return cy.get(`.honorariaAnalysis-widget .team-list .honorariaAnalysis-table-row:nth-child(${row}) .honorariaAnalysis-table-cell:nth-child(${column})`).scrollIntoView()
    }

    getAMNameOnAccountRevenue () {
        return cy.get('.dashboard-wrapper__account-revenue .account-manager-section  div')
    }

    getCountForMonthlyOnAccountRevenue () {
        return cy.get('.MuiTableBody-root tr:nth-child(1)')
    }

    getColumnForMonthlyOnAccountRevenue (row) {
       return cy.get(`.MuiTableBody-root tr:nth-child(${row}) th`)
    }

    getRevenue (row, column) {
        return cy.get(`.MuiTableBody-root tr:nth-child(${row}) td:nth-child(${column})`)
    }

    getTotalOnAccountRevenue (row, column) {
        return cy.get(`.MuiTableBody-root tr:nth-child(${row}) td:nth-child(${column})`)
    }

    getQuarterlyButtonOnAccountRevenue () {
        return cy.get('.month-quarter-toggle-container-desktop button:nth-child(2)')
    }

    getMonthForQuarterlyOnAccountRevenue (row) {
        return cy.get(`.desktop-teamRevenue .month-list .quarterly-month:nth-child(${row}) .quarterly-month-label`)
    }

    getMonthValueForQuarterlyOnAccountRevenue (row) {
        return cy.get(`.desktop-teamRevenue .month-list .quarterly-month:nth-child(${row}) .quarterly-month-value`)
    }

    getQuarterlyTargetForAM () {
        return cy.get(' .desktop-teamRevenue .total-quarter-target')
    }

    getQuarterlyAchievementForAM () {
        return cy.get('.desktop-teamRevenue .total-quarter-achievement-container div.total-quarter-achievement')
    }
  }
  export default DashboardPage

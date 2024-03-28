class ClientViewPage {
  getClientViewLinkButton () {
    return cy.get('a[href*="client-view"]').should('exist')
  }

  getEplExpertName () {
    return cy.get('.epl__expert-name')
  }

  getEplContent () {
    return cy.get('.project-segment .epl')
  }

  expandExpertProfile (expertName) {
    return cy.get('.epl__expert-name').contains(expertName).parent().find('.epl__link').click()
  }

  getExpertPosition (expertName) {
    return cy.get('.epl__expert-name').contains(expertName).parent().find('.epl__text-bold').first()
  }

  getExpertCompanyAndExperience (expertName) {
    return cy.get('.epl__expert-name').contains(expertName).parent().find('.epl__text-group .epl__text-bold').first()
  }

  getProfilePopupExpertName () {
    return cy.get('.client-view__expert-profile__title')
  }

  getProfilePopupExpertPosition () {
    return cy.get('.client-view__expert-profile__text--large').first()
  }

  getProfilePopupExpertCompanyAndDuration () {
    return cy.get('.client-view__expert-profile__text--large').last()
  }

  getProfilePopupHeaders(){
    return cy.get('.client-view__expert-profile__subtitle')
  }

  getProfilePopupScreening () {
    return cy.get('.client-view__expert-profile__subtitle').contains('Screening').parent().find('.expert-profile__text p')
  }

  getProfilePopupAvailability () {
    return cy.get('.client-view__expert-profile__subtitle').contains('Availability').parent().find('.expert-profile__text')
  }

  getProfilePopupLanguageName () {
    return cy.get('.client-view__language-list .language__name')
  }

  getProfilePopupPositions () {
    return cy.get('.client-view__expert-profile__experience')
  }

  getProfilePopupIndustryExperience () {
    return cy.get('.client-view__expert-profile__subtitle').contains('Relevance Statement').parent().find('.client-view__expert-profile__text p')
  }
}

export default ClientViewPage

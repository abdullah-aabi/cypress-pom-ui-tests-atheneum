// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands'
import './apiCommands'
import './capiCommands'
import './mckinseyCommands'
import './testDataCommands'
import './mckinseyUICommands'
import "cypress-audit/commands"
require('cypress-grep')()

// Alternatively you can use CommonJS syntax:
// require('./commands') test

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
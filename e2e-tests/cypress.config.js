const { defineConfig } = require('cypress')
const axios = require('axios');
const xlsx = require('node-xlsx').default;
const fs = require('fs');
const { lighthouse, prepareAudit } = require("cypress-audit");

function sleep(seconds) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}

module.exports = defineConfig({
  e2e: {
    retries: 0,
    defaultCommandTimeout: 90000,
    requestTimeout: 30000,
    responseTimeout: 90000,
    numTestsKeptInMemory: 5,
    viewportHeight: 1080,
    viewportWidth: 1900,
    projectId: 'ngti2a',
    specPattern: 'cypress/e2e/**/**/*Spec.js',
    watchForFileChanges: false,
    video: false,
    videoCompression: 10,
    videoUploadOnPasses: false,
    env: {
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    setupNodeEvents(on, config) {
      require('dotenv').config()
      config.env = {
        ...process.env,
        ...config.env,
      }
      require('cypress-grep/src/plugin')(config)

      const stage = config.env.STAGE !== undefined ? config.env.STAGE : "integration"

      // eslint-disable-next-line no-console
      console.log("USING STAGE: " + stage)
      config.env.EXPERT_SERVICE_URL = `https://services.${stage}.atheneum-dev.com/expert-service`
      config.env.CALENDAR_SERVICE_URL = `https://services.${stage}.atheneum-dev.com/calendar-service`
      config.env.SEARCH_SERVICE_URL = `https://services.${stage}.atheneum-dev.com/search-service`
      config.env.SHERLOCK_URL = `https://services.${stage}.atheneum-dev.com/sherlock`
      config.env.REACT_APP_MASS_PROCESSOR_URL = `https://services.${stage}.atheneum-dev.com/mass-processor`
      config.env.CAPI_TEST_URL = `https://services.${stage}.atheneum-dev.com/capi-service`
      config.env.MOCK_CAPI_URL = `https://services.${stage}.atheneum-dev.com/mock-mckinsey-api`
      config.env.LEGACY_PLATFORM_APP_URL = `https://platform.${stage}.atheneum-dev.com`
      config.env.EXPERTS_PLATFORM_APP_URL = `https://experts.${stage}.atheneum-dev.com`
      config.env.CLIENTS_PLATFORM_APP_URL = `https://clients.${stage}.atheneum-dev.com`
      config.env.MESSAGING_SERVICE_URL = `https://services.${stage}.atheneum-dev.com/messaging-service`

      on("before:browser:launch", (browser = {}, launchOptions) => {
        prepareAudit(launchOptions);
      });

      on("task", {
        async getWebhookNotifications(path, retries = 30) {
          for (let i = 0; i <= retries; i++) {
            const url = `${config.env.MOCK_CAPI_URL}/latest-events`
            // eslint-disable-next-line no-console
            const events = (await axios(url)).data
            if (events && events.length && events[0].url === path) {
              // map to request catcher format
              return {
                ...events[0],
                path: events[0].url,
                method: events[0].method.toUpperCase(),
                body: JSON.stringify(JSON.stringify(events[0].data))
              }
            }
            await sleep(1)
          }
          return null
        },
        async parseXlsx(filePath) {
          const jsonData = await xlsx.parse(fs.readFileSync(filePath))
          fs.unlinkSync(filePath)
          return jsonData
        },
        async lighthouse(allOptions) {
          let txt
          // calling the function is important
          const lighthouseTask = lighthouse((lighthouseReport) => {
            let lighthouseScoreText = ''
            let lighthouseResult = lighthouseReport?.lhr?.categories
            let lighthousePerformance =
              'Performance: ' + lighthouseResult?.performance?.score + '\n'
            let lighthouseAccessibility =
              'Accessibility: ' + lighthouseResult?.accessibility?.score + '\n'
            let lighthouseBestPractices =
              'Best Practices: ' +
              lighthouseResult?.['best-practices']?.score +
              '\n'
            let lighthouseSEO = 'SEO: ' + lighthouseResult?.seo?.score + '\n'
            lighthouseScoreText =
              lighthousePerformance +
              lighthouseAccessibility +
              lighthouseBestPractices +
              lighthouseSEO

            txt = lighthouseScoreText
          })

          const report = await lighthouseTask(allOptions)
          // insert the text into the report returned the test
          report.txt = txt
          return report
        },
      })
      return config
    }
  },
})

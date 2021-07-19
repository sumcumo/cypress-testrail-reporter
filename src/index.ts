#!/usr/bin/env node

import readConfig from './helper/readConfig'
import parseCypressResults from './parser'
import TestRailReporter from './reporter'
import print from './helper/printer'
import { TestrailReporterConfig } from './types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs')

const config = readConfig() as TestrailReporterConfig
yargs
  .command('$0', 'Report Cypress Test Results to Testrail')
  .usage('Usage: $0 <command> [options]')
  .option('name', {
    demandOption: true,
    describe: 'Name of the Test Run',
    type: 'string',
  })
  .option('suiteId', {
    demandOption: false,
    describe: 'related Testrail Suite Id',
    type: 'string',
    default: config?.suiteId || null,
  })
  .option('reportFilename', {
    demandOption: false,
    describe: 'Cypress Result as json file - can also be defined within your cypress.json testrailReporter section',
    type: 'string',
    default: config?.reportFilename,
  })
  .option('closeRun', {
    demandOption: false,
    default: false,
    describe: 'Flag to close the testrail run after reporting',
    type: 'boolean',
  })
  .option('host', {
    demandOption: true,
    describe: 'Testrail Host (eg. https://example.testrail.io/) - can also be defined within your cypress.json testrailReporter section',
    type: 'string',
    default: config?.host,
  })
  .option('username', {
    demandOption: true,
    describe: 'Testrail Username - can also be defined within your cypress.json testrailReporter section',
    type: 'string',
    default: config?.user,
  })
  .option('password', {
    demandOption: true,
    describe: 'Testrail Password - can also be defined within your cypress.json testrailReporter section',
    type: 'string',
    default: config?.password,
  })
  .option('assets', {
    demandOption: false,
    describe: 'Should Cypress Videos / Screenshots be uploaded and attached to the current run?',
    type: 'array',
    default: [],
  })
  .option('assetsArchiveName', {
    demandOption: false,
    describe: 'Provide a name for your assets Archive. Default: cypressAssets',
    type: 'string',
    default: 'cypressAssets',
  })
  .option('attach', {
    demandOption: false,
    describe: 'Do you have files you want to attach to this run?',
    type: 'array',
    default: [],
  })
  .option('includeAll', {
    demandOption: false,
    describe: 'Whether include all test cases of the test suite',
    type: 'boolean',
    default: config.includeAll,
  })
  .help()

const {
  name, reportFilename, closeRun, attach,
} = yargs.argv

print('Start Test Rail Export', name, reportFilename, closeRun, attach, yargs.argv.assets)

const defaultConfig = {
  includeAll: false,
}

// // ParseCypressResults
parseCypressResults(reportFilename)
  .then(async (parsedTestResults) => {
    print('Test results parsed')
    print('Passed:', parsedTestResults.analysis.passed)
    print('Skipped:', parsedTestResults.analysis.skipped)
    print('Failed:', parsedTestResults.analysis.failed)

    print('parsedTestResults', JSON.stringify(parsedTestResults))

    // post Results to testrail
    try {
      const reporter = new TestRailReporter(
        {
          ...defaultConfig,
          ...config,
          user: yargs.argv.username,
          password: yargs.argv.password,
          host: yargs.argv.host,
          suiteId: yargs.argv.suiteId,
        },
        name,
        parsedTestResults.testRailCases,
      )

      await reporter.postResults(
        closeRun,
        yargs.argv.attach,
        yargs.argv.assets,
        yargs.argv.assetsArchiveName,
      )
    } catch (e) {
      print('Posting Failed', e)
      process.exit(1)
    }
  })
  .catch((e) => {
    print('Failed', e)
    process.exit(1)
  })

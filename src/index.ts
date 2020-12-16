import readConfig from './helper/readConfig'
import parseCypressResults from './parser'
import TestRailReporter from './reporter'
import print from './helper/printer'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargs = require('yargs')

// Do not Close Run By Default
// let closeRun = false

// const config = readConfig()

yargs
  .command('$0', 'Report Cypress Test Results to Testrail')
  .option('n', {
    alias: 'name',
    demandOption: true,
    describe: 'Name of the Test Run',
    type: 'string',
  })
  .option('r', {
    alias: 'report',
    demandOption: true,
    describe: 'Cypress Result as json file',
    type: 'string',
  })
  .option('closeRun', {
    demandOption: false,
    default: false,
    describe: 'Flag to close the testrail run after reporting',
    type: 'boolean',
  })
  .help()

// const { files, output } = yargs.argv

print('yargs', yargs.argv)
// print('config', config)

// import readConfig from './helper/readConfig'
// import parseCypressResults from './parser'
// import TestRailReporter from './reporter'
// import print from './helper/printer'
//
// // Do not Close Run By Default
// let closeRun = false
//
// const config = readConfig()
//
// // Ignore first two args
// const args = process.argv.slice(2)
//
// // Map Args
// const branchName = args[0]
// const cypressResult = args[1]
// const closeRunArg = args[2]
//
// // Validate required Args
// if (!branchName) {
//   throw Error('Branch Name missing')
// }
// if (!cypressResult) {
//   throw Error('No Results specified')
// }
//
// // Determine if test run should be closed
// closeRun = typeof closeRunArg !== 'undefined' && closeRunArg === 'TRUE'
//
// print('Start Test Rail Export', branchName, cypressResult, closeRun, process.argv.slice(2))
//
// // // ParseCypressResults
// parseCypressResults(cypressResult)
//   .then(async (parsedTestResults) => {
//     print('Test results parsed')
//     print('Passed:', parsedTestResults.analysis.passed)
//     print('Failed:', parsedTestResults.analysis.failed)
//
//     print('parsedTestResults', JSON.stringify(parsedTestResults))
//
//     // post Results to testrail
//     try {
//       const reporter = new TestRailReporter(
//         config,
//         branchName,
//         parsedTestResults.testRailCases,
//       )
//       const postResult: boolean = await reporter.postResults(closeRun)
//
//       if (!postResult) {
//         throw new Error(`Posting failed for ${branchName}`)
//       }
//     } catch (e) {
//       print('Posting Failed', e)
//       process.exit(1)
//     }
//   })

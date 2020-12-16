#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const yargs = require('yargs')
const path = require('path')
const fs = require('fs')

const readConfig = require('../src/helper/readConfig')
const parseCypressResults = require('../src/parser')
const TestRailReporter = require('../src/reporter')
const print = require('../src/helper/printer')

yargs
  .command('$0 [files..]', 'Merge report files', yargs => {
    yargs.positional('files', {
      description: 'input files',
      type: 'array',
      alias: ['f'],
    })
  })
  .option('o', {
    alias: 'output',
    demandOption: false,
    describe: 'Output file path',
    type: 'string',
  })
  .option('f', {
    alias: 'files',
    demandOption: false,
    describe: 'Input files',
    type: 'array',
  })
  .help()

// const { files, output } = yargs.argv

print('yargs', yargs.argv)

// merge({ files }).then(
//   report => {
//     const content = JSON.stringify(report, null, 2)
//     if (output) {
//       const outputFilePath = path.resolve(process.cwd(), output)
//       fs.mkdirSync(path.dirname(outputFilePath), { recursive: true })
//       fs.writeFileSync(outputFilePath, content, { flag: 'w' })
//       console.info(`Reports merged to ${outputFilePath}`)
//     } else {
//       process.stdout.write(content)
//     }
//   },
//   error => {
//     console.error('ERROR: Failed to merge reports\n')
//     console.error(error)
//     process.exit(1)
//   }
// )

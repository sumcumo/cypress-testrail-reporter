import fs from 'fs'
import { TestrailReporterConfig } from '../types'

export default function readConfig(): TestrailReporterConfig | null {
  try {
    const config = fs.readFileSync(`${process.cwd()}/cypress.json`, 'utf-8')
    const cypressConfig = JSON.parse(config)

    return {
      ...cypressConfig.testrailReporter,
      reportFilename: cypressConfig.testrailReporter?.reportFilename,
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`No cypress.json config found at ${process.cwd()}`)
    process.exit(1)
  }
  return null
}

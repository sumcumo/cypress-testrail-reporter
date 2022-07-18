import fs from 'fs'
import { TestrailReporterConfig } from '../types'

export default function readConfig(): TestrailReporterConfig | null {
  try {
    const config = fs.readFileSync(`${process.cwd()}/testrailReporter.json`, 'utf-8')
    const testrailReporterConfig = JSON.parse(config)

    return {
      ...testrailReporterConfig.testrailReporter,
      reportFilename: testrailReporterConfig.testrailReporter?.reportFilename,
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`No testrailReporter.json config found at ${process.cwd()}`)
    process.exit(1)
  }
  return null
}

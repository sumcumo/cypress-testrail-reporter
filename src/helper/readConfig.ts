import fs from 'fs'
import { TestrailConnectorConfig } from '../types'

export default function readConfig(): TestrailConnectorConfig {
  try {
    const config = fs.readFileSync(`${process.cwd()}/cypress.json`, 'utf-8')
    const cypressConfig = JSON.parse(config)
    return cypressConfig?.testrailConnector
  } catch (e) {
    console.error(`No cypress.json config found at ${process.cwd()}`)
    process.exit(1)
  }
}

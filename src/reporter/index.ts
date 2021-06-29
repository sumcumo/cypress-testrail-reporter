import sleep from '../helper/sleep'
import { getCombinedTestCaseStatusId } from '../helper/testCaseStatus'
import {
  CypressReportError,
  TestrailReporterConfig,
  TestRailCypressResults,
  TestRailReference,
  TestRailRun,
} from '../types'

import print from '../helper/printer'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TestRailConnector = require('@sum.cumo/node-testrail')

export function getFormattedErrorMessages(testCase: TestRailReference): string | null {
  if (testCase?.err?.length > 0) {
    const errorMessages = testCase.err.map((e: CypressReportError) => e.message.replace('CypressError:', '**CypressError:**'))
    return errorMessages.join('\r\n')
  }
  return null
}

class TestRailReporter {
  private readonly branchName: string

  private readonly config: TestrailReporterConfig

  private readonly cases: TestRailReference[]

  private currentRun: null | TestRailRun

  private client: any

  public refs: null | string

  constructor(config: TestrailReporterConfig, branchName: string, cases: TestRailReference[]) {
    this.config = config
    this.branchName = branchName
    this.cases = cases
    this.currentRun = null

    this.setRefs()

    // Connect to API
    this.client = new TestRailConnector(
      config.host,
      config.user,
      config.password,
    )
  }

  get hasCases() {
    return this.cases && this.cases.length > 0
  }

  /**
   * Should only post results if cases were provided
   * @returns {boolean}
   */
  shouldPostResults(): boolean {
    return this.hasCases
  }

  setRefs(): void {
    this.refs = null
    const regex = this.getBranchReferenceRegex()
    if (regex !== null) {
      const refs = this.branchName.match(regex as RegExp)
      if (refs) {
        this.refs = refs.map((ref) => ref.toUpperCase()).join(', ')
      }
    }
  }

  getBranchReferenceRegex(): RegExp | null {
    if (this.config.branchReferenceRegex) {
      return new RegExp(this.config.branchReferenceRegex, 'gi')
    }
    return null
  }

  getCoveredCases(): Array<string> {
    return this.cases.map((c) => c.caseId)
  }

  getTestRailResults(): TestRailCypressResults {
    return {
      results: this.cases.map((testCase: TestRailReference) => ({
        case_id: testCase.caseId,
        status_id: getCombinedTestCaseStatusId(testCase.results),
        comment: getFormattedErrorMessages(testCase),
      })),
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onError(e: any): void {
    throw new Error(e.response?.data?.error || e)
  }

  async findOrCreateRunByName(runs: TestRailRun[]): Promise<TestRailRun> {
    let run = runs.find((r) => !r.is_completed && r.name === this.branchName)

    const caseIds = this.getCoveredCases()
    print('cids', caseIds)

    const description = `Cypress test run for ${this.branchName}`

    // No Run Found?
    if (!run) {
      // Create Testrun for Branch
      print(`Add Run ${this.branchName}`, caseIds)
      run = this.client
        .addRun(
          this.config.projectId,
          this.config.suiteId,
          this.branchName,
          description,
          null,
          false,
          caseIds,
          this.refs,
        )
        .then((response) => response.data)
        .catch(this.onError) as TestRailRun
    } else {
      // Update existing Testrun
      print(`Update Run ${this.branchName}`, run.id, caseIds)
      const updateRunResponse = this.client
        .updateRun(
          run.id,
          this.branchName,
          description,
          run.milestone_id,
          false,
          caseIds,
          this.refs,
        )
        .then((response) => response.data)
        .catch(this.onError)
      print('Run updated', updateRunResponse)
    }

    // Wait 10 seconds before continuing to let testrail fully process the new / updated run
    await sleep(10000)

    return run
  }

  private async findOrCreateRun(): Promise<TestRailRun> {
    try {
      return this.client
        .getRuns(this.config.projectId)
        .then((response) => response.data)
        .then(this.findOrCreateRunByName.bind(this))
        .catch(this.onError)
    } catch (e) {
      throw new Error(e)
    }
  }

  private async addResultsForCases(): Promise<boolean> {
    if (this.shouldPostResults()) {
      // Do we have a valid run?
      if (this.currentRun && this.currentRun.id) {
        print('POST', this.cases, this.currentRun.id)
        // Add Results
        try {
          const result = await this.client
            .addResultsForCases(this.currentRun.id, this.getTestRailResults())
            .then((response) => response.data)
            .catch(this.onError)

          if (!Array.isArray(result) || result.length === 0) {
            print('Post not successful', result)
            return false
          }
        } catch (e) {
          throw new Error(e)
        }
      }
    } else {
      print('SKIPPING')
    }

    return false
  }

  private async addAttachmentsToTestRun(attachments: string[]) {
    this.client.addAttachmentsToRun(this.currentRun?.id, attachments)
  }

  private async addAssetsToTestRun(assets: string[], assetsArchiveName: string) {
    this.client.addAttachmentsToRun(this.currentRun?.id, assets, assetsArchiveName)
  }

  async postResults(
    closeRun: boolean,
    attachments: string[],
    assets: string[],
    assetsArchiveName: string,
  ) {
    // Fetch Runs from testrail
    this.currentRun = await this.findOrCreateRun()

    await this.addResultsForCases()

    await this.addAttachmentsToTestRun(attachments)

    if (assets.length > 0 && assetsArchiveName) {
      await this.addAssetsToTestRun(assets, assetsArchiveName)
    }

    if (closeRun) {
      print('Close RUN')
      await this.closeTestrailRun()
    }
  }

  async closeTestrailRun(): Promise<void> {
    try {
      print(`closeRun ${this.currentRun?.id}`)
      await this.client
        .closeRun(this.currentRun?.id)
        .catch(this.onError)
      this.currentRun = null
    } catch (e) {
      throw new Error(e)
    }
  }
}

export default TestRailReporter

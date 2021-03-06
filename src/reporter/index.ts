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

  /**
   * Should only post results if cases were provided
   * @returns {boolean}
   */
  shouldPostResults(): boolean {
    return this.cases && this.cases.length > 0
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
    throw new Error(e.response.data.error || e)
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
          null,
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

  async postResults(closeRun: boolean): Promise<boolean> {
    if (this.shouldPostResults()) {
      // Fetch Runs from testrail
      try {
        this.currentRun = await this.client
          .getRuns(this.config.projectId)
          .then((response) => response.data)
          .then(this.findOrCreateRunByName.bind(this))
          .catch(this.onError)
      } catch (e) {
        throw new Error(e)
      }

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

          if (closeRun) {
            print('Close RUN')
            await this.closeTestrailRun()
          }
          return true
        } catch (e) {
          throw new Error(e)
        }
      }
    } else {
      print('SKIPPING')
    }

    return false
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

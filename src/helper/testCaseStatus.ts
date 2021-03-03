import { CypressReportSuiteTest } from '../types'

// Determine status_id based on pass prop
// 1: Passed,
// 2: Blocked,
// 3: Untested,
// 4: Retest,
// 5: Failed,
const enum TestrailStatusIds {
  Passed = 1, // 1
  Blocked, // 2
  Untested, // 3
  Retest, // 4
  Failed, // 5
}

export default function getTestCaseStatusId(test: CypressReportSuiteTest): number {
  switch (true) {
    case test.pass:
      return TestrailStatusIds.Passed
    case test.pending:
      return TestrailStatusIds.Blocked
    default:
      return TestrailStatusIds.Failed
  }
}

export function getCombinedTestCaseStatusId(results: number[]): number {
  switch (true) {
    // All Passed?
    case results.every((result: number) => result === TestrailStatusIds.Passed):
      return TestrailStatusIds.Passed
    // At least one failure?
    case results.some((result: number) => result === TestrailStatusIds.Failed):
      return TestrailStatusIds.Failed
    // Has at least one Blocked
    case results.some((result: number) => result === TestrailStatusIds.Blocked):
      return TestrailStatusIds.Blocked
    default:
      return TestrailStatusIds.Failed
  }
}

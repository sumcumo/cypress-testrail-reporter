// Determine status_id based on pass prop
// 1: Passed,
// 2: Blocked,
// 3: Untested,
// 4: Retest,
// 5: Failed,
import { TestRailReference } from '../types'

export default function getTestCaseStatusId(testCase: TestRailReference): number {
  return testCase.pass.every((passed) => passed) ? 1 : 5
}

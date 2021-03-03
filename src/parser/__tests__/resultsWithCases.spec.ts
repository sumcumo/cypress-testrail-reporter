import { resultsWithCases } from '../index'
import { CypressTestRailResult, TestRailReference } from '../../types'

/**
 * resultsWithCases
 */
test('should return false for no results', () => {
  expect(resultsWithCases({} as CypressTestRailResult)).toBeFalsy()
})

test('should return false for no results with cases', () => {
  expect(resultsWithCases({ cases: {}, file: '' } as CypressTestRailResult)).toBeFalsy()
})

test('should return true if results with cases were provided', () => {
  const cases: CypressTestRailResult = {
    file: '',
    cases: {
      32: {
        caseId: '32',
        results: [1],
        err: [],
      } as TestRailReference,
    },
  }
  expect(resultsWithCases(cases)).toBeTruthy()
})

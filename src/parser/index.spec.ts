import {
  CypressReportSuiteTest,
  CypressTestRailResult,
  TestRailReference,
} from '../types'
import { getErrorForTest, resultsWithCases, analyzeResults } from './index'

/**
 * getErrorForTest
 */
test('should return false if no error was provided', () => {
  expect(getErrorForTest({} as CypressReportSuiteTest)).toBeFalsy()
})

test('should return false if no error message is present', () => {
  expect(getErrorForTest({ err: {} } as CypressReportSuiteTest)).toBeFalsy()
})

test('should return error message', () => {
  expect(getErrorForTest({ err: { message: 'TEST' } } as CypressReportSuiteTest)).toEqual({ message: 'TEST' })
})

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
        pass: [true],
        err: [],
      } as TestRailReference,
    },
  }
  expect(resultsWithCases(cases)).toBeTruthy()
})

/**
 * analyzeResults
 */
test('should handle empty result', () => {
  const initial = {
    passed: 0,
    failed: 0,
  }
  const result: CypressTestRailResult = {
    cases: {},
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 0,
    failed: 0,
  })
})

test('should detect single passed test', () => {
  const initial = {
    passed: 0,
    failed: 0,
  }
  const result: CypressTestRailResult = {
    cases: {
      1: {
        caseId: '1',
        pass: [true],
        err: [],
      },
    },
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 1,
    failed: 0,
  })
})

test('should detect multiple pass references for single test', () => {
  const initial = {
    passed: 0,
    failed: 0,
  }
  const result: CypressTestRailResult = {
    cases: {
      1: {
        caseId: '1',
        pass: [true, true, true],
        err: [],
      },
    },
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 1,
    failed: 0,
  })
})

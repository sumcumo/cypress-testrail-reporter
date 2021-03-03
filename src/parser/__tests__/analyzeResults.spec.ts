import { CypressTestRailResult } from '../../types'
import { analyzeResults } from '../index'

/**
 * analyzeResults
 */
test('should handle empty result', () => {
  const initial = {
    passed: 0,
    failed: 0,
    skipped: 0,
  }
  const result: CypressTestRailResult = {
    cases: {},
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 0,
    failed: 0,
    skipped: 0,
  })
})

test('should detect single passed test', () => {
  const initial = {
    passed: 0,
    failed: 0,
    skipped: 0,
  }
  const result: CypressTestRailResult = {
    cases: {
      1: {
        caseId: '1',
        results: [1],
        err: [],
      },
    },
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 1,
    failed: 0,
    skipped: 0,
  })
})

test('should detect pending test', () => {
  const initial = {
    passed: 0,
    failed: 0,
    skipped: 0,
  }
  const result: CypressTestRailResult = {
    cases: {
      1: {
        caseId: '1',
        results: [1, 1, 2, 1],
        err: [],
      },
    },
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 0,
    failed: 0,
    skipped: 1,
  })
})

test('should mark tests as failed if at least one failed', () => {
  const initial = {
    passed: 0,
    failed: 0,
    skipped: 0,
  }
  const result: CypressTestRailResult = {
    cases: {
      1: {
        caseId: '1',
        results: [1, 1, 2, 5],
        err: [],
      },
    },
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 0,
    failed: 1,
    skipped: 1,
  })
})

test('should detect multiple pass references for single test', () => {
  const initial = {
    passed: 0,
    failed: 0,
    skipped: 0,
  }
  const result: CypressTestRailResult = {
    cases: {
      1: {
        caseId: '1',
        results: [1, 1, 1],
        err: [],
      },
    },
    file: '',
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 1,
    failed: 0,
    skipped: 0,
  })
})

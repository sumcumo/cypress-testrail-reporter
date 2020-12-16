import { getError, resultsWithCases, analyzeResults } from './index'

/**
 * getError
 */
test('should return false if no error was provided', () => {
  expect(getError({})).toBeFalsy()
})

test('should return false if no error message is present', () => {
  expect(getError({ err: {} })).toBeFalsy()
})

test('should return error message', () => {
  expect(getError({ err: { message: 'TEST' } })).toEqual({ message: 'TEST' })
})

/**
 * resultsWithCases
 */
test('should return false for no results', () => {
  expect(resultsWithCases({})).toBeFalsy()
})

test('should return false for no results with cases', () => {
  expect(resultsWithCases({ ids: [1, 2, 3, 4] })).toBeFalsy()
})

test('should return true if results with cases were provided', () => {
  expect(resultsWithCases({ cases: [1, 2, 3, 4] })).toBeTruthy()
})

/**
 * analyzeResults
 */
test('should handle empty result', () => {
  const initial = {
    passed: 0,
    failed: 0,
  }
  const result = {
    cases: {},
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
  const result = {
    cases: {
      1: {
        pass: [true],
      },
    },
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
  const result = {
    cases: {
      1: {
        pass: [true, true, true],
      },
    },
  }
  expect(analyzeResults(initial, result)).toEqual({
    passed: 1,
    failed: 0,
  })
})

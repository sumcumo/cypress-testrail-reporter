import getTestCaseStatusId, { getCombinedTestCaseStatusId } from '../testCaseStatus'
import { CypressReportSuiteTest } from '../../types'

/**
 * getTestCaseStatusId
 */
test('should return 1 (PASSED) for only passed tests', () => {
  const testCase: CypressReportSuiteTest = {
    title: 'successfully verifies sth',
    fullTitle: 'verify sth [123] successfully verifies sth',
    timedOut: null,
    duration: 0,
    state: 'passed',
    speed: null,
    pass: true,
    fail: false,
    pending: false,
    context: null,
    code: '',
    err: {},
    uuid: '36347f33-e270-4f02-91e8-a916043c62aa',
    parentUUID: '8cdd344e-3225-4b1c-a7b1-37df014debd7',
    isHook: false,
    skipped: false,
  }
  expect(getTestCaseStatusId(testCase)).toBe(1)
})

test('should return 5 (Failed) when test failed', () => {
  const testCase: CypressReportSuiteTest = {
    title: 'successfully verifies sth',
    fullTitle: 'verify sth [123] successfully verifies sth',
    timedOut: null,
    duration: 0,
    state: 'passed',
    speed: null,
    pass: false,
    fail: true,
    pending: false,
    context: null,
    code: '',
    err: {},
    uuid: '36347f33-e270-4f02-91e8-a916043c62aa',
    parentUUID: '8cdd344e-3225-4b1c-a7b1-37df014debd7',
    isHook: false,
    skipped: false,
  }
  expect(getTestCaseStatusId(testCase)).toBe(5)
})

test('should return 2 (Blocked) when test is pending', () => {
  const testCase: CypressReportSuiteTest = {
    title: 'successfully verifies sth',
    fullTitle: 'verify sth [123] successfully verifies sth',
    timedOut: null,
    duration: 0,
    state: 'passed',
    speed: null,
    pass: false,
    fail: false,
    pending: true,
    context: null,
    code: '',
    err: {},
    uuid: '36347f33-e270-4f02-91e8-a916043c62aa',
    parentUUID: '8cdd344e-3225-4b1c-a7b1-37df014debd7',
    isHook: false,
    skipped: false,
  }
  expect(getTestCaseStatusId(testCase)).toBe(2)
})

test('should return 5 (Failed) when test result can not be detected', () => {
  const testCase: CypressReportSuiteTest = {
    title: 'successfully verifies sth',
    fullTitle: 'verify sth [123] successfully verifies sth',
    timedOut: null,
    duration: 0,
    state: 'passed',
    speed: null,
    pass: false,
    fail: false,
    pending: false,
    context: null,
    code: '',
    err: {},
    uuid: '36347f33-e270-4f02-91e8-a916043c62aa',
    parentUUID: '8cdd344e-3225-4b1c-a7b1-37df014debd7',
    isHook: false,
    skipped: true,
  }
  expect(getTestCaseStatusId(testCase)).toBe(5)
})

/**
 * getCombinedTestCaseStatusId
 */
test('should return 1 (Passed) when all tests did pass', () => {
  expect(getCombinedTestCaseStatusId([1, 1, 1])).toEqual(1)
  expect(getCombinedTestCaseStatusId([1])).toEqual(1)
})

test('should return 5 (Failed) when at least one tests did fail', () => {
  expect(getCombinedTestCaseStatusId([1, 1, 5])).toEqual(5)
  expect(getCombinedTestCaseStatusId([1, 1, 2, 5])).toEqual(5)
})

test('should return 2 (Pending) when at least one test was pending and other passed', () => {
  expect(getCombinedTestCaseStatusId([1, 1, 2])).toEqual(2)
  expect(getCombinedTestCaseStatusId([2])).toEqual(2)
  expect(getCombinedTestCaseStatusId([2, 2, 2])).toEqual(2)
})

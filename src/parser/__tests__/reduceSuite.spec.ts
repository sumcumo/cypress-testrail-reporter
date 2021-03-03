import {
  TestRailReference,
} from '../../types'
import { parseSuite } from '../index'
import singleSuiteWithPassedTests from './suites/singleSuiteWithPassedTests'
import singleSuiteWithPendingTests from './suites/singleSuiteWithPendingTests'

/**
 * parseSuite
 */
test('should detect passed tests', () => {
  const cases = {} as TestRailReference
  singleSuiteWithPassedTests.suites.reduce(parseSuite, cases)

  expect(cases).toMatchObject({ 123: { caseId: '123', err: [], results: [1, 1] } })
})

test('should detect pending tests', () => {
  const cases = {} as TestRailReference
  singleSuiteWithPendingTests.suites.reduce(parseSuite, cases)

  expect(cases).toMatchObject({ 123: { caseId: '123', err: [], results: [2, 2] } })
})

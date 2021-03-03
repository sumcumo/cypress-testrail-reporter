import {
  CypressReportSuiteTest,
} from '../../types'
import { getErrorForTest } from '../index'

/**
 * getErrorForTest
 */
test('should return false if no error was provided', () => {
  expect(getErrorForTest({} as CypressReportSuiteTest)).toBeFalsy()
})

test('should return false if no error message is present', () => {
  expect(getErrorForTest({ err: {} } as CypressReportSuiteTest)).toBeFalsy()
})

test('should return simple error message', () => {
  expect(getErrorForTest({ err: { message: 'TEST' } } as CypressReportSuiteTest)).toEqual({ message: 'TEST' })
})

test('should return error message with prefix', () => {
  expect(getErrorForTest({ err: { message: 'TEST' } } as CypressReportSuiteTest, '[SOME_TEST_PREFIX] My Test Title'))
    .toEqual({ message: '[SOME_TEST_PREFIX] My Test Title: TEST' })
})

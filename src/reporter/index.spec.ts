import { TestRailReference } from '../types'
import { getFormattedErrorMessages } from './index'

/**
 * getFormattedErrorMessages
 */
test('should return null if no error is present', () => {
  expect(getFormattedErrorMessages({} as TestRailReference)).toEqual(null)
})

test('should return formatted single error message', () => {
  const testCase: TestRailReference = {
    err: [{
      message: 'CypressError: test',
      estack: '',
      diff: '',
    }],
    caseId: '1',
    results: [5],
  }

  expect(getFormattedErrorMessages(testCase)).toEqual('**CypressError:** test')
})

test('should return formatted error messages', () => {
  const testCase: TestRailReference = {
    err: [{
      message: 'CypressError: test',
      estack: 'estack test',
      diff: 'diff test',
    }, {
      message: 'CypressError: test2',
      estack: 'estack test2',
      diff: 'diff test2',
    }],
    caseId: '1',
    results: [5],
  }

  expect(getFormattedErrorMessages(testCase)).toEqual('**CypressError:** test\r\n**CypressError:** test2')
})

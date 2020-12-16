import { getFormattedErrorMessages } from './index'

/**
 * getFormattedErrorMessages
 */
test('should return null if no error is present', () => {
  expect(getFormattedErrorMessages({})).toEqual(null)
})

test('should return formatted single error message', () => {
  const testCase = {
    err: [{
      message: 'CypressError: test',
    }],
  }

  expect(getFormattedErrorMessages(testCase)).toEqual('**CypressError:** test')
})

test('should return formatted error messages', () => {
  const testCase = {
    err: [{
      message: 'CypressError: test',
    }, {
      message: 'CypressError: test2',
    }],
  }

  expect(getFormattedErrorMessages(testCase)).toEqual('**CypressError:** test\r\n**CypressError:** test2')
})

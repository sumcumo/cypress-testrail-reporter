import fs from 'fs'
import {
  CombinedResult,
  CypressReportError,
  CypressReportResult,
  CypressReportSuite,
  CypressReportSuiteTest,
  CypressTestRailResult,
  ReportAnalysis,
  TestRailReference,
} from '../types'

const CASE_REGEX = /(^.*)\[(\d*(,\s*\d+)*)\]/

/**
 * Get Formatted Error for Test. Pass optional title to prefix errors
 * @param test
 * @param testTitle
 */
export function getErrorForTest(
  test: CypressReportSuiteTest,
  testTitle: string | null = null,
): CypressReportError | boolean {
  if (!test.err || !test.err.message) return false
  let { message } = test.err
  if (testTitle) {
    message = `${testTitle}: ${test.err.message}`
  }

  return {
    ...test.err,
    message,
  }
}

export function reduceSuite(
  acc: {[caseId: string]: TestRailReference},
  suite: CypressReportSuite,
): {[caseId: string]: TestRailReference} {
  if (CASE_REGEX.test(suite.title)) {
    const titleParts = CASE_REGEX.exec(suite.title)
    const [title, caseIds] = titleParts || ['', '']

    caseIds.split(',').forEach((id) => {
      const caseId = id.trim()
      // Store Case ID
      acc[caseId] = {
        ...(acc[caseId] || {}),
        caseId,
        pass: [
          ...(acc[caseId] ? acc[caseId].pass : []),
          suite.tests.every((t) => t.pass),
        ],
        err: [
          ...(acc[caseId] ? acc[caseId].err : []),
          ...suite.tests.map((t) => getErrorForTest(t, title)),
        ].filter(Boolean),
      }
    })
  } else {
    suite.tests.forEach((test) => {
      if (CASE_REGEX.test(test.title)) {
        const titleParts = CASE_REGEX.exec(test.title)
        const [title, caseIds] = titleParts || ['', '']

        caseIds.split(',').forEach((id) => {
          const caseId = id.trim()
          acc[caseId] = {
            ...(acc[caseId] || {}),
            caseId,
            pass: [
              ...(acc[caseId] ? acc[caseId].pass : []),
              test.pass,
            ],
            err: [
              ...(acc[caseId] ? acc[caseId].err : []),
              getErrorForTest(test, title),
            ].filter(Boolean),
          }
        })
      }
      return false
    })
  }
  return acc
}

export function reduceResults(
  acc: Array<CypressTestRailResult>,
  result: CypressReportResult,
): Array<CypressTestRailResult> {
  const testResult: CypressTestRailResult = {
    file: result.file,
    cases: {},
  }
  result.suites.reduce(reduceSuite, testResult.cases)

  // Store
  acc.push(testResult)

  return acc
}

export function resultsWithCases(r: CypressTestRailResult): boolean {
  return Object.entries(r.cases || {}).length > 0
}

export function analyzeResults(
  acc: ReportAnalysis,
  result: CypressTestRailResult,
): ReportAnalysis {
  acc.passed += Object.keys(result.cases)
    .filter((id) => result.cases[id].pass.every((p) => p))
    .length
  acc.failed += Object.keys(result.cases)
    .filter((id) => result.cases[id].pass.some((p) => !p))
    .length
  return acc
}

export function parseCypressResults(cypressResults: string): Promise<CombinedResult> {
  return new Promise((resolve) => {
    const cypressReports = cypressResults.split(',')

    const combined = cypressReports.reduce((acc, report) => {
      const parsedTestResults = []
      // Read Content from JSON
      const content = fs.readFileSync(report.trim(), { encoding: 'utf-8' })
      // Parse Content
      const combinedReport = JSON.parse(content)

      // Scan
      combinedReport.results.reduce(reduceResults, parsedTestResults)

      // Quickly analyze results
      const analysis = parsedTestResults.reduce(analyzeResults, acc.analysis)

      // Return combined Results
      return {
        ...acc,
        analysis,
        results: [
          ...acc.results,
          ...parsedTestResults,
        ],
      }
    }, {
      analysis: {
        passed: 0,
        failed: 0,
      },
      results: [],
      testRailCases: [],
    } as CombinedResult)

    // prepare cases
    combined.testRailCases = combined.results
      // Remove Tests without TestCraft references
      .filter(resultsWithCases)
      // Combine Cases
      .reduce((acc, result) => {
        Object.keys(result.cases).forEach((caseId) => {
          const match = acc.findIndex((r) => r.caseId === caseId)

          if (match < 0) {
            // ADD New Result
            acc.push(result.cases[caseId])
          } else {
            // Extend existing result
            acc[match] = {
              ...(acc[match] ? acc[match] : result.cases[caseId]),
              pass: [
                ...acc[match].pass,
                ...result.cases[caseId].pass,
              ],
              err: [
                ...acc[match].err,
                ...result.cases[caseId].err,
              ],
            }
          }
        })

        return acc
      }, [])

    return resolve(combined)
  })
}

export default parseCypressResults

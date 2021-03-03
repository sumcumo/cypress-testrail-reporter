import fs from 'fs'
import getTestCaseStatusId from '../helper/testCaseStatus'
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

/**
 * REGEX To identify Case References in Test Titles like 'My Test [12345]'
 */
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
  if (!test.err || !(test.err as CypressReportError).message) return false
  let { message } = test.err as CypressReportError
  if (testTitle) {
    message = `${testTitle}: ${message}`
  }

  return {
    ...test.err as CypressReportError,
    message,
  }
}

export function parseSuite(
  acc: {[caseId: string]: TestRailReference},
  suite: CypressReportSuite,
): {[caseId: string]: TestRailReference} {
  if (CASE_REGEX.test(suite.title)) {
    const titleParts = CASE_REGEX.exec(suite.title)
    const [, title, caseIds] = titleParts || ['', '']

    caseIds.split(',').forEach((id) => {
      const caseId = id.trim()
      // Store Case ID
      acc[caseId] = {
        ...(acc[caseId] || {}),
        caseId,
        results: [
          ...(acc[caseId] ? acc[caseId].results : []),
          ...suite.tests.map((test) => getTestCaseStatusId(test)),
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
        const [, title, caseIds] = titleParts || ['', '']

        caseIds.split(',').forEach((id) => {
          const caseId = id.trim()
          acc[caseId] = {
            ...(acc[caseId] || {}),
            caseId,
            results: [
              ...(acc[caseId] ? acc[caseId].results : []),
              getTestCaseStatusId(test),
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

export function parseResults(
  acc: Array<CypressTestRailResult>,
  result: CypressReportResult,
): Array<CypressTestRailResult> {
  const testResult: CypressTestRailResult = {
    file: result.file,
    cases: {},
  }
  result.suites.reduce(parseSuite, testResult.cases)

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
    .filter(
      (id) => result.cases[id].results.every((testRailStatusId: number) => testRailStatusId === 1),
    )
    .length
  acc.failed += Object.keys(result.cases)
    .filter(
      (id) => result.cases[id].results.some((testRailStatusId: number) => testRailStatusId === 5),
    )
    .length
  acc.skipped += Object.keys(result.cases)
    .filter(
      (id) => result.cases[id].results.some((testRailStatusId: number) => testRailStatusId === 2),
    )
    .length

  return acc
}

export function parseAndAnalyzeReports(acc: CombinedResult, report: string) {
  const parsedTestResults = []
  // Read Content from JSON
  const content = fs.readFileSync(report.trim(), { encoding: 'utf-8' })
  // Parse Content
  const combinedReport = JSON.parse(content)

  // Scan
  combinedReport.results.reduce(parseResults, parsedTestResults)
  acc.results = [
    ...acc.results,
    ...parsedTestResults,
  ]

  // Quickly analyze results
  acc.analysis = parsedTestResults.reduce(analyzeResults, acc.analysis)

  // Return combined Results
  return acc
}

export function combineResults(acc: Array<TestRailReference>, result: CypressTestRailResult) {
  Object.keys(result.cases).forEach((caseId) => {
    const match = acc.findIndex((r) => r.caseId === caseId)

    if (match < 0) {
      // ADD New Result
      acc.push(result.cases[caseId])
    } else {
      // Extend existing result
      acc[match] = {
        ...(acc[match] ? acc[match] : result.cases[caseId]),
        results: [
          ...acc[match].results,
          ...result.cases[caseId].results,
        ],
        err: [
          ...acc[match].err,
          ...result.cases[caseId].err,
        ],
      }
    }
  })

  return acc
}

export function parseCypressResults(cypressResults: string): Promise<CombinedResult> {
  return new Promise((resolve) => {
    const cypressReports = cypressResults.split(',')

    const combined: CombinedResult = {
      analysis: {
        passed: 0,
        failed: 0,
        skipped: 0,
      },
      results: [],
      testRailCases: [],
    }
    cypressReports.reduce(parseAndAnalyzeReports, combined)

    // prepare cases
    combined.results
      .filter(resultsWithCases)
      .reduce(combineResults, combined.testRailCases)
    // combined.testRailCases = extractTestrailCases(combined.results)

    return resolve(combined)
  })
}

export default parseCypressResults

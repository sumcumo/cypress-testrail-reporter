export type TestrailConnectorConfig = {
  projectId: string,
  branchReferenceRegex: string,
  host: string,
  user: string,
  password: string,
}

export type TestRailReference = {
  caseId: string,
  pass: boolean[],
  err: Array<CypressReportError | boolean>
}

export type TestRailRun = {
  id: number,
  name: string,
  // eslint-disable-next-line camelcase
  is_completed: boolean,
}

export type TestRailCypressResult = {
  // eslint-disable-next-line camelcase
  case_id: string,
  // eslint-disable-next-line camelcase
  status_id: number,
  comment: string | null,
}
export type TestRailCypressResults = {
  results: Array<TestRailCypressResult>
}

export type CypressTestRailResult = {
  file: string,
  cases: {[caseId: string]: TestRailReference}
}

export type ReportAnalysis = {
  passed: number,
  failed: number,
}

export type CombinedResult = {
  analysis: ReportAnalysis,
  results: Array<any>,
  testRailCases: Array<any>
}

export type CypressReportResult = {
  uuid: string,
  title: string,
  fullFile: string,
  file: string,
  beforeHooks: Array<any>,
  afterHooks: Array<any>,
  tests: Array<any>,
  suites: Array<CypressReportSuite>,
  passes: Array<string>,
  failures: Array<string>,
  pending: Array<string>,
  skipped: Array<string>,
  duration: number,
  root: boolean,
  rootEmpty: boolean,
  _timeout: number
}

export type CypressReportSuite = {
    uuid: string,
    title: string,
    fullFile: string,
    file: string,
    beforeHooks: Array<any>,
    afterHooks: Array<any>,
    tests: Array<CypressReportSuiteTest>,
    suites: Array<any>,
    passes: Array<string>,
    failures: Array<string>,
    pending: Array<string>,
    skipped: Array<string>,
    duration: number,
    root: boolean,
    rootEmpty: boolean,
    _timeout: number
}

export type CypressReportSuiteTest = {
  title: string,
  fullTitle: string,
  timedOut: any,
  duration: number,
  state: string, // "passed",
  speed: string, // "slow",
  pass: boolean,
  fail: boolean,
  pending: boolean,
  context: any,
  code: string,
  err: CypressReportError,
  uuid: string, // "5e093513-32a1-443d-a9c2-486b86e618e3",
  parentUUID: string, // "f3ad4a2d-1490-48fb-9171-daf4c5660404",
  isHook: boolean,
  skipped: boolean,
}

export type CypressReportError = {
  message: string,
  estack: string,
  diff: string,
}

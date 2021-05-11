export type CypressReportError = {
  message: string,
  estack: string,
  diff: string,
}

export type TestrailReporterConfig = {
  projectId: string,
  suiteId: string | null,
  branchReferenceRegex: string,
  reportFilename: string,
  host: string,
  user: string,
  password: string,
  screenshotsFolder: string,
  videosFolder: string,
}

export type TestRailReference = {
  caseId: string,
  results: number[],
  err: Array<CypressReportError | boolean>
}

export type TestRailRun = {
  id: number,
  name: string,
  // eslint-disable-next-line camelcase
  is_completed: boolean,
  // eslint-disable-next-line camelcase
  milestone_id: number | null,
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
  skipped: number,
}

export type CombinedResult = {
  analysis: ReportAnalysis,
  results: Array<CypressTestRailResult>,
  testRailCases: Array<TestRailReference>
}

export type CypressReportSuiteTest = {
  title: string,
  fullTitle: string,
  timedOut: any,
  duration: number,
  state: string, // "passed",
  speed: string | null, // "slow",
  pass: boolean,
  fail: boolean,
  pending: boolean,
  context: any,
  code: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  err: CypressReportError | {},
  uuid: string, // "5e093513-32a1-443d-a9c2-486b86e618e3",
  parentUUID: string, // "f3ad4a2d-1490-48fb-9171-daf4c5660404",
  isHook: boolean,
  skipped: boolean,
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

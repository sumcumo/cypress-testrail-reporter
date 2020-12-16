# cypress-testrail-reporter
This little tool will help you parsing and posting your cypress test results to testrail.

## Preconditions
This tools works with Mochawesome Json Reports. So please make sure you have the following packages installed: 
```
yarn add --dev mocha mochawesome mochawesome-merge
```


Example Configuration of the Mochawesome Reporter (`cypress.json`): 
``` json
    "reporter": "mochawesome",
    "reporterOptions": {
        "reportDir": "test/cypress/results",
        "reportFilename": "mochawesomeReport.json",
        "overwrite": false,
        "html": false,
        "json": true
    },
```

This tool internally uses `@sum.cumo/Node-TestRail` (https://github.com/sumcumo/Node-TestRail) as Testrail API Client.

## Config
The Testrail Reporter gets it's config from your `cypress.json` and / or provided cli arguments.

### Configuration via `cypress.json`
Add a `testrailReporter` section to your Cypress Config. You can provide the following:

Argument                    | Description
------                      | ------
`projectId`                 | The ID of your Testrail Project
`branchReferenceRegex`      | This Reporter will create JIRA References if this regex is matching your Branch name
`host`                      | The Address of your running Testrail Application (API)
`username`                  | A Username for Authentication against Testrail API
`password`                  | The corresponding password

Example:
``` json
{
    ...
    "testrailReporter": {
        "projectId": "1",
        "branchReferenceRegex": "((feat|chore)-\\d*)",
        "host": "https://example.testrail.io/",
        "user": "some@one.com",
        "password": "YOUR_PASSWORD"
    },
```

### Configuration via CLI Arguments
You can also provide the arguments `name` `password` and `host` within the cli like
```
yarn cypress-testrail-reporter --user some@one.com --password YOUR_PASSWORD --host https://example.testrail.io/
``` 

## Usage
As soon as your Mochawesome Report was generated you can execute the following
```
yarn cypress-testrail-reporter --name NAME_OF_YOUR_TESTRUN
```

This will create a new or update an existing Testrun with the given name and will report all results found in your Mochawesome Report.


Argument                    | Description
------                      | ------
`name`                      | The Name of your Testrail Run
`report`                    | The relative path to your report (from `process.cwd`).Example: `result.json`  Default: `reporterOptions.reportFilename`
`closeRun`                  | Whether to close the run automatically or not. Default: `false`
`host`                      | The Address of your running Testrail Application (API)
`username`                  | A Username for Authentication against Testrail API
`password`                  | The corresponding password 

Further Details:
```
yarn cypress-testrail-reporter --help
```

## CI Integration

This Reporter is intended to be used in your CI / CD Pipeline. 

```yaml
Integration Test:
  scripts:
   - yarn cypress # Run your cypress tests
   - yarn cypress-testrail-reporter --name $CI_COMMIT_REF_SLUG --user $TESTRAIL_USERNAME --password $TESTRAIL_PASSWORD
```

The Example above will report result for the current branch and uses global variables for authentication. So you don't have to store credetnials within your project and can use Gitlab CI Variables instead.

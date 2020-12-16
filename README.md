# cypress-testrail-reporter
Parse and Post your cypress results to testrail

## Config
cypress.json
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

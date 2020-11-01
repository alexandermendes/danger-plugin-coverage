# danger-plugin-coverage

[![npm version](https://badge.fury.io/js/danger-plugin-coverage.svg)](https://badge.fury.io/js/danger-plugin-coverage)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![.github/workflows/deploy.yml](https://github.com/alexandermendes/danger-plugin-coverage/workflows/.github/workflows/release.yml/badge.svg)](https://github.com/alexandermendes/danger-plugin-coverage/actions)


> A Danger plugin to report code coverage.

This plugin detects and parses coverage reports, posting the results as a
Markdown table back to the pull request.

It uses the `clover.xml` format, which is output by [Istanbul](https://istanbul.js.org/),
a coverage reporter integrated with JavaScript testing tools such as
[Jest](https://jestjs.io/) and [Karma](https://karma-runner.github.io/).

This format can also be output by testing libraries for other languages, such as
[PHPUnit](https://phpunit.de/). So, while this is primarily intended as a tool
to run against JavaScript packages it would technically work as a coverage
reporter for other languages too.

<details>
  <summary>View an example report</summary>

## Coverage Report

> Test coverage is looking a little low for the files created or modified in this PR, perhaps we need to improve this.

```
Coverage threshold for branches (80%) not met: 33.33%
Coverage threshold for functions (80%) not met: 66.67%
```

|Impacted Files|% Stmts|% Branch|% Funcs||
|---|:-:|:-:|:-:|:-:|
|[src/module-one.js]()|100|100|100|:white_check_mark:|
|[src/module-two.js]()|95.24|33.33|66.67|:x:|
|[src/module-three.js]()|82.33|100|44.55|:x:|
|[src/module-four.js]()|95.24|82.55|81.55|:white_check_mark:|

</details>

## Usage

Install:

```sh
yarn add danger-plugin-coverage --dev
```

At a glance:

```js
// dangerfile.js
import coverage from 'danger-plugin-coverage';

schedule(coverage());
```

Note that the coverage report output by your test runner must exist before Danger
is run. By default we will look for the report at `coverage/clover.xml`, which
is the default output location for Jest.

## Settings

The function accepts a settings object with the following properties:

| name               | description                                                                                  |
|--------------------|----------------------------------------------------------------------------------------------|
| `successMessage`   | A custom message to show when coverage is above the threshold.                               |
| `failureMessage`   | A custom message to show when coverage is bellow the threshold.                              |
| `cloverReportPath` | Override automatic coverage report detection to provide the relative path to a report.       |
| `maxRows`          | The number of rows to show (additional rows will be collapsed within a `<details>` element). |
| `threshold`        | The thresholds at which to show the failure messaging.                                       |

**Example:**

```js
import coverage from 'danger-plugin-coverage';

schedule(coverage({
  successMessage: ':+1: Test coverage is looking good.',
  failureMessage: ':-1: Test coverage is not looking so good.',
  cloverReportPath: './coverage/clover.xml',
  maxRows: 5,
  threshold: {
    statements: 80,
    branches: 80,
    functions: 80,
  },
}));
```
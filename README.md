# danger-plugin-coverage

[![npm version](https://badge.fury.io/js/danger-plugin-coverage.svg)](https://badge.fury.io/js/danger-plugin-coverage)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![.github/workflows/deploy.yml](https://github.com/alexandermendes/danger-plugin-coverage/workflows/.github/workflows/release.yml/badge.svg)](https://github.com/alexandermendes/danger-plugin-coverage/actions)


> A Danger plugin to report code coverage.

This plugin reads coverage report in the `clover.xml` format. This format is
output by [Jest](https://jestjs.io/) and [Jasmine](https://jasmine.github.io/),
as well as testing tools in other languages, such as [PHPUnit](https://phpunit.de/).

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

Coverage will be reported like so:

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

Contributing
============

Thanks for contributing!

## Before you contribute

This package is a fork of [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal). This library has added handling for React. Before contributing, _please make sure the issue relates directly to this library and not fast-deep-equals_.

We encourage pull requests concerning:

* React features not handled in this library
* Integrating updates from `fast-deep-equal`. This unfortunately, now requires more manual work to use the comment blocks in `index.js` to figure out what to paste and where.
* Integrating tests from `fast-deep-equal`. This usually entails upgrading the `git`-based dependencies of `fast-deep-equal-git` and `npm`-published package of `fast-deep-equal` in `package.json:devDependencies`.
* Bugs in this library
* New tests for React
* Documentation

Pull requests that should be for [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal):

* Equality of non-react comparisons
* Performance of non-react comparisons
* Tests for non-react comparisons

## Development

Install the project using `yarn` (which we've standardized on for development):

```sh
$ yarn install
```

`tl;dr` -- Everything you normally need to run is aggregated into:

```sh
$ yarn run test
$ yarn run benchmark
```

(We use `builder` to parallelize things, so tasks may output in different
orders)

### Testing

We write one set of tests located in:

- `tests/node/**.spec.js`

that run in two very different scenarios:

#### Node

The tests are natively run in `node` (hence why they are located in `tests/node`
to begin with) without any transpilation or "build". You can run them with:

```sh
# Single run
$ yarn run test-node

# Persistent watch
$ yarn run test-node --watch
```

#### Browsers

The same tests are then imported and built with `webpack` to a test bundle that
can be run in arbitrary browsers. So far in CI, we execute the tests in headless
Chrome on Linux in Travis and IE11 in Appveyor.

To run the browser tests on your machine (note: you must already have the
browser you're running installed):

```sh
# Default: headless chrome
$ yarn run test-browser
# Example: real Chrome + Firefox + Safari
$ yarn run test-browser --browsers Chrome,Firefox,Safari

# IE11 (on Windows)
$ yarn run test-browser-ie
```

### Types

We validate our TypeScript `index.d.ts` with:

```sh
$ yarn run test-ts
```

### Style

```sh
$ yarn run eslint
```

### Size

You can check how we do with minification + compression with:

```sh
# Show minified output
$ yarn -s compress

# Display minified + gzip'ed size in bytes.
$ yarn size-min-gz
     651
```

**Note**: If the min+gz size increases, please note it in the README. If it is a significant increase, please flag to your reviewers and have a discussion about whether or not the size addition is justified.

## Before submitting a PR...

Before you go ahead and submit a PR, make sure that you have done the following:

```sh
$ yarn run test
$ yarn run benchmark
```

1. Everything must be correct / pass checks.
2. You should also check the benchmark stats and make sure that we don't have any significant performance regressions (check out `master` for a baseline comparison on _your_ machine).
    - Please **do** update the README benchmark numbers for changes in your PR so that we have much easier discussion points _and_ our users get up-to-date information.

## Releasing a new version to NPM

_Only for project administrators_.

1. Run `npm version patch` (or `minor|major|VERSION`) to run tests and lint,
   build published directories, then update `package.json` + add a git tag.
2. Run `npm publish` and publish to NPM if all is well.
3. Run `git push && git push --tags`

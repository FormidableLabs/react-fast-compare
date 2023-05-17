# Contributing

Thanks for contributing!

## Before you contribute

This package is a fork of [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal). This library has added handling for React.
Before contributing, _please make sure the issue relates directly to this library and not fast-deep-equal_.

We encourage pull requests concerning:

- React features not handled in this library
- Integrating updates from `fast-deep-equal` － This, unfortunately, now requires more manual work. Use the comment blocks in `index.js`
  to figure out what to paste and where.
- Integrating tests from `fast-deep-equal` － This usually entails upgrading the `git`-based dependencies of `fast-deep-equal-git` and
  `npm`-published package of `fast-deep-equal` in `package.json:devDependencies`.
- Bugs in this library
- New tests for React
- Documentation

Pull requests that should be for [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal):

- Equality of non-react comparisons
- Performance of non-react comparisons
- Tests for non-react comparisons

## Development

Install the project using `yarn` (which we've standardized on for development):

```sh
$ yarn install
```

**TL; DR:** － Everything you normally need to run is aggregated into:

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

We validate our TypeScript `index.d.ts` with two steps:

```sh
# Runs the TypeScript compiler over our types
$ yarn run test-ts-defs

# Runs our types through a sample TypeScript file
$ yarn run test-ts-usage
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
```

**Note**: If the min+gz size increases, please note it in the README. If it is a significant increase,
please flag to your reviewers and have a discussion about whether or not the size addition is justified.

## Before submitting a PR...

... please make sure that you have done the following:

1. Confirm that all checks are passing:

   ```sh
   $ yarn run test
   $ yarn run benchmark
   ```

2. Confirm we don't have any significant performance regressions (check out `master` for a baseline comparison on _your_ machine).

3. Confirm you aren't impacting our bundle size.
   If you _do_ affect the bundle size, please update the bundle badge in the Readme by
   - Following the steps outlined in [size](#size):
     `yarn -s compress && yarn size-min-gz`
   - Grabbing that output and replacing the current size in the bundle_img: (`https://img.shields.io/badge/minzipped%20size-<NEW_SIZE>%20B-flatgreen.svg`)
     For example, if the new size is `650`, the new bundle_img will be `https://img.shields.io/badge/minzipped%20size-650%20B-flatgreen.svg`
   - _Org members:_ Update the README's benchmark comparison png using this [internal Google Sheet template](https://docs.google.com/spreadsheets/d/1GuqpO0wgPjQ9usx6sR3t0Y_HTmAdRqjXkSjs3SBsmTc/edit?usp=sharing_eip&ts=5ed1642f).

### Using changesets

Our official release path is to use automation to perform the actual publishing of our packages. The steps are to:

1. A human developer adds a changeset. Ideally this is as a part of a PR that will have a version impact on a package.
2. On merge of a PR our automation system opens a "Version Packages" PR.
3. On merging the "Version Packages" PR, the automation system publishes the packages.

Here are more details:

### Add a changeset

When you would like to add a changeset (which creates a file indicating the type of change), in your branch/PR issue this command:

```sh
$ yarn changeset
```

to produce an interactive menu. Navigate the packages with arrow keys and hit `<space>` to select 1+ packages. Hit `<return>` when done. Select semver versions for packages and add appropriate messages. From there, you'll be prompted to enter a summary of the change. Some tips for this summary:

1. Aim for a single line, 1+ sentences as appropriate.
2. Include issue links in GH format (e.g. `#123`).
3. You don't need to reference the current pull request or whatnot, as that will be added later automatically.

After this, you'll see a new uncommitted file in `.changesets` like:

```sh
$ git status
# ....
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.changeset/flimsy-pandas-marry.md
```

Review the file, make any necessary adjustments, and commit it to source. When we eventually do a package release, the changeset notes and version will be incorporated!

### Creating versions

On a merge of a feature PR, the changesets GitHub action will open a new PR titled `"Version Packages"`. This PR is automatically kept up to date with additional PRs with changesets. So, if you're not ready to publish yet, just keep merging feature PRs and then merge the version packages PR later.

### Publishing packages

On the merge of a version packages PR, the changesets GitHub action will publish the packages to npm.

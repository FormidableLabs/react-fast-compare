# Contributing

Thanks for contributing!

## Before you contribute

This package is a fork of [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal). This library has added handling for React.
Before contributing, _please make sure the issue relates directly to this library and not fast-deep-equal_.

We encourage pull requests concerning:

- React features not handled in this library
- Integrating updates from `fast-deep-equal` － This, unfortunately, now requires more manual work. Use the comment blocks in `index.js`
  to figure out what to paste and where.
- Integrating tests from `fast-deep-equal` － Copy its `spec/` test files into `test/fixtures/fast-deep-equal/`
  and update the version in that directory's README. The `fast-deep-equal` npm package in `devDependencies` is the
  benchmark baseline.
- Bugs in this library
- New tests for React
- Documentation

Pull requests that should be for [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal):

- Equality of non-react comparisons
- Performance of non-react comparisons
- Tests for non-react comparisons

## Development

### Setup

We develop on the Node.js version in [`.nvmrc`](./.nvmrc) (CI uses it too). With
[nvm](https://github.com/nvm-sh/nvm) or a compatible tool:

```sh
$ nvm use
```

We use [pnpm](https://pnpm.io/) for development. The version is pinned in
`package.json`'s `packageManager` field; with
[Corepack](https://nodejs.org/api/corepack.html) or pnpm's own version
management, the right version is picked up automatically.

```sh
$ pnpm install
```

pnpm only installs versions published at least 7 days ago
(`minimumReleaseAge` in `pnpm-workspace.yaml`), transitive dependencies
included. For an urgent security fix that's newer than that, add the package to
`minimumReleaseAgeExclude` with a comment and a date to remove it.

**TL; DR:** － Everything you normally need to run is aggregated into:

```sh
# Format, lint, types, all tests, then the packed package
$ pnpm run check
$ pnpm run benchmark
```

### Testing

We test with [Vitest](https://vitest.dev/). One set of specs, `test/*.spec.mjs`,
runs in two projects (`vitest.config.mts`):

- `node`: Node, with [jsdom](https://github.com/jsdom/jsdom) for the specs
  that need a DOM.
- `browser`: [Vitest browser mode](https://vitest.dev/guide/browser/) in
  headless Chromium, Firefox and WebKit, through Playwright.

Most generic test cases come from `fast-deep-equal`, vendored unchanged in
`test/fixtures/fast-deep-equal/` (see its README). Our own cases (React
elements, custom behavior) are in `test/fixtures/index.mjs`, and
`test/react.spec.mjs` renders real React and Preact (`preact/compat`)
components.

Install the browsers once (and again when Playwright is updated):

```sh
$ pnpm exec playwright install --only-shell chromium firefox webkit
```

```sh
# All projects
$ pnpm test

# Node only, or one browser
$ pnpm test --project node
$ pnpm test --project "browser (firefox)"

# Watch mode
$ pnpm vitest --project node

# Coverage (Node only; v8 coverage doesn't work in Firefox or WebKit)
$ pnpm test --project node --coverage
```

CI runs every project on Linux and adds the coverage summary to the job
summary. It runs the Node project on Windows, and on React 18.0.0 with Preact
10 (the lockfile has React 19 and Preact 11).

### Types

`pnpm types:check` type-checks `index.js` from its JSDoc and checks that the declarations it emits match `index.d.ts`. `pnpm pack:check` then compiles the type probe in `test/types/` against the packed package, as a CommonJS (`.cts`) and an ES module (`.mts`) consumer. Add a case there for any usage the types must keep supporting.

### Style

We format with [oxfmt](https://oxc.rs/docs/guide/usage/formatter) and lint with [oxlint](https://oxc.rs/docs/guide/usage/linter). Their configs are `.oxfmtrc.json` and `.oxlintrc.json`.

```sh
# Check formatting and lint
$ pnpm run format
$ pnpm run lint

# Fix what can be fixed automatically
$ pnpm run format:fix
$ pnpm run lint:fix
```

`index.js` stays ES5 in 3.x, so don't apply ES2015+ fixes (`let`/`const`, arrow functions) to it.

### GitHub Actions

Workflows reference GitHub's own actions (`actions/*`, `github/*`) by major
version tag, such as `actions/checkout@v7`. Third-party actions are pinned to a
commit SHA with the version in a comment, such as
`pnpm/action-setup@<sha> # v6.1.0`, because a tag can be moved to different
code. [zizmor](https://docs.zizmor.sh) enforces this (`.github/zizmor.yml`)
along with its other security checks.

CI runs zizmor in the `lint-gha` job, at the `version` pinned there.
`pnpm lint:gha` (part of `pnpm check`) runs it locally if it's installed, and
skips otherwise. Newer zizmor releases add audits, so a different version
locally can report findings that CI doesn't. To match CI, install that version,
e.g. `uv tool install zizmor==1.31.1` (or `brew install zizmor` for the
latest). Set `GH_TOKEN` to include zizmor's online audits.

To update actions:

- Third-party actions: run `pinact run --update`
  ([pinact](https://github.com/suzuki-shunsuke/pinact), `brew install pinact`).
  It updates SHAs and their version comments, skipping versions published in
  the last week (`.github/pinact.yml`). Review each action's release notes.
- GitHub's actions: check each one's releases page for a new major and read its
  breaking changes.
- zizmor itself: bump `version` on the zizmor step in
  `.github/workflows/ci.yml`.

### Published package

`pnpm pack:check` (part of `pnpm check`) packs the package and checks what it publishes:

- publint and [attw](https://github.com/arethetypeswrong/arethetypeswrong.github.io) find no problems.
- Installed in a clean directory, `require('react-fast-compare')` and `import isEqual from 'react-fast-compare'` give the same working function.
- The tarball matches `pack-snapshot.json`: manifest fields, file list, type resolution, `index.d.ts`, and `index.js` minified without comments.

The snapshot was generated from the published 3.2.2 tarball. In 3.x, changes to `index.js` that only touch formatting or comments pass. Anything else fails until you run `pnpm pack:check --update` and commit the new snapshot, so every change to what users get shows up in review. To check another tarball, such as a published version, pass `--tarball <file>` (from `npm pack react-fast-compare@<version>`).

### Size

`pnpm size` reports the size of `index.js`: raw, minified (terser, with
top-level mangling), and minified with gzip and brotli. Pass `--base <git ref>`
to compare with another version:

```sh
$ pnpm size
$ pnpm size --base master
```

CI runs it against the base commit and adds the table to the job summary. It's
a report, not a check: if the min+gz size grows significantly, flag it to your
reviewers so you can discuss whether the addition is worth it.

## Before submitting a PR...

... please make sure that you have done the following:

1. Confirm that all checks are passing:

   ```sh
   $ pnpm run check
   $ pnpm run benchmark
   ```

2. Confirm we don't have any significant performance regressions (check out `master` for a baseline comparison on _your_ machine).

3. Confirm you aren't significantly impacting our bundle size (see [size](#size)).
   - _Org members:_ Update the README's benchmark comparison png using this [internal Google Sheet template](https://docs.google.com/spreadsheets/d/1GuqpO0wgPjQ9usx6sR3t0Y_HTmAdRqjXkSjs3SBsmTc/edit?usp=sharing_eip&ts=5ed1642f).

## Releasing

We release with [changesets](https://github.com/changesets/changesets) and
GitHub Actions ([`release.yml`](./.github/workflows/release.yml)). Nobody
publishes from their machine: npm
[trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) lets
only that workflow, running in the `npm-publish` environment, publish the
package, with provenance.

1. A PR that changes what users get adds a changeset.
2. When it merges to `master`, the workflow opens (or updates) a
   "Version Packages" PR.
3. When that PR merges, the workflow publishes to npm and creates the
   `v{version}` tag and GitHub release.

### Add a changeset

In your branch, run:

```sh
$ pnpm changeset
```

Pick the semver bump and write a summary. Some tips for the summary:

1. Aim for a single line, 1+ sentences as appropriate.
2. Include issue links in GH format (e.g. `#123`).
3. You don't need to reference the current pull request; the changelog adds it
   automatically.

This creates a file like `.changeset/flimsy-pandas-marry.md`. Review it and
commit it with your PR.

Changes that don't affect the published package (tests, tooling, CI, docs)
don't need a changeset.

### Versioning and publishing

Changesets accumulate on `master`, and the "Version Packages" PR keeps up with
them: it bumps `package.json` and writes `CHANGELOG.md`. If you're not ready to
release, keep merging feature PRs and merge the "Version Packages" PR later.

CI on that PR doesn't start on its own (it's opened with the default
`GITHUB_TOKEN`). A maintainer clicks "Approve and run" after its latest update.

Merging it runs the publish job, which waits for the `npm-publish`
environment's rules (and approval, if it requires reviewers).

### Canary releases

To try unreleased changes from npm, a maintainer can publish a canary of any
branch the `npm-publish` environment allows, to the `next` dist-tag:

```sh
$ gh workflow run release.yml --ref <branch>
```

It publishes `X.Y.Z-canary-<datetime>`, where `X.Y.Z` is the version the
pending changesets would release, so the branch needs at least one changeset.
Install it with `npm install react-fast-compare@next`.

### npm and GitHub setup

The trusted publisher on npm names the workflow file (`release.yml`) and the
environment (`npm-publish`). Renaming either breaks publishing until the npm
package settings are updated to match.

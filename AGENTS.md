# AGENTS.md

Guidance for AI coding agents (and humans) working in this repo. Keep it short and current: when a convention changes, update this file in the same PR.

## Current focus: 2026 Uplift

Tracking issue: https://github.com/FormidableLabs/react-fast-compare/issues/140. Read it before starting uplift work; its **Decision log** is the source of truth for settled choices. Don't re-open a logged decision without saying why.

- **Branch:** `master`. The uplift landed from the integration branch `chore/2026-uplift` with a merge commit; PRs now target `master` directly, starting with the source fixes (#139 Temporal, ...).
- **The uplift doesn't change what users get.** Same files, same `module.exports = isEqual`, same ES5 code, same `index.d.ts` as 3.2.2. In `index.js`, only formatting and comments may change; `pnpm pack:check` proves it. ESM, an `exports` map and a modern target wait for 4.0.0.
- **Infra first, source last.** Mechanical churn (formatting, lint autofixes) goes in its own PR with no behavior change, and its commit is added to `.git-blame-ignore-revs` after it merges (PRs are squash-merged).
- **Tasks are plain `package.json` scripts.** No task runner.
- **Small, reviewable PRs.** One concern per PR. A PR that changes what users get (code, types, published files, manifest fields other than `scripts`/`devDependencies`) needs a changeset (`pnpm changeset`). Tooling, tests, CI and docs don't, and uplift PRs have none.

## Working agreements

- **Don't commit, stage, push, merge, or open PRs** unless explicitly asked. Prepare the changes in the working tree and suggest a commit message; the maintainer does the git work.
- Don't publish to npm or change npm/GitHub settings (trusted publishers, environments, dist-tags, repo secrets). Write the scripts and docs; a maintainer runs them.
- Report outcomes plainly: if a check was skipped or fails, say so with the output.

## Releasing

- `release.yml`'s filename and the `npm-publish` environment are bound to npm trusted publishing (OIDC; tokens are disallowed). Renaming either breaks publishing until a maintainer updates the npm package settings.
- Version Packages PRs are opened by `GITHUB_TOKEN`, so GitHub holds their CI runs for approval. After the PR's last update, a maintainer clicks "Approve and run" on the held runs.
- Canaries: `gh workflow run release.yml --ref <branch>` publishes `X.Y.Z-canary-<datetime>` to `next`; the branch needs a pending changeset. Maintainer-run.

## Repo map

- `index.js`: the whole library, CommonJS, **ES5**. `index.d.ts`: the hand-written published declarations. These two files are all that's published.
- `test/*.spec.mjs`: Vitest specs, run in Node and in browsers. `test/fixtures/index.mjs` holds our own cases; `test/fixtures/fast-deep-equal/` is upstream's `spec/` vendored unchanged (don't edit or reformat it). `test/types/`: the type probe, compiled against the packed tarball by `pack:check`.
- `bench/`: Vitest benchmarks (`compare.bench.mjs`) and the CI job-summary reporter.
- `scripts/`: `pack-check.mjs`, `types-check.mjs`, `size.mjs`, `lint-gha.mjs`.
- `pack-snapshot.json`: what `pack:check` compares the packed tarball with (generated from 3.2.2).
- `vitest.config.mts`: `node` and `browser` (Chromium, Firefox, WebKit) projects; an inline plugin wraps the CommonJS files for the browser.

## Commands

Use the Node version in `.nvmrc` and pnpm (version from `packageManager`). Never use npm or yarn to install.
pnpm settings (`minimumReleaseAge`, ...) live in `pnpm-workspace.yaml`. `minimumReleaseAge` is 7 days and applies to the lockfile too: if `pnpm install` fails with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, re-resolve the named packages with `pnpm update <name> ...`. Don't add `minimumReleaseAgeExclude` entries except for an urgent security fix (CONTRIBUTING "Setup").

```sh
pnpm install
pnpm exec playwright install --only-shell chromium firefox webkit  # once, and after Playwright updates
pnpm check          # format, lint, lint:gha, types:check, test, pack:check (what CI gates on)
pnpm test           # Vitest, all projects; `--project node` or `--project "browser (firefox)"` for one
pnpm test --project node --coverage
pnpm types:check    # checkJs on index.js; emitted declarations must match index.d.ts
pnpm pack:check     # packed tarball vs. 3.2.2: publint, attw, require/import, snapshot, type probe
pnpm size           # raw/min/gz/br size of index.js; `--base <ref>` to compare
pnpm bench          # tree vs. last release vs. fast-deep-equal, per fixture group
pnpm lint:fix       # oxlint
pnpm format:fix     # oxfmt
pnpm lint:gha       # zizmor on .github/ (skips if zizmor isn't installed; CI runs it)
pnpm dep:check      # list outdated deps (npm-check-updates; config in .ncurc.cjs)
pnpm dlx knip       # unused deps audit when tools change (config in knip.jsonc)
```

Dependency updates are manual (no update bots): see CONTRIBUTING "Updating dependencies". Version ranges: `^` by default; exact for oxfmt, oxlint, the tools `pack:check`/`types:check` rely on (TypeScript, terser, publint, attw) and the benchmark baselines (`fast-deep-equal`, `react-fast-compare-published`). The package has no `dependencies`.

GitHub Actions: `actions/*` and `github/*` use major version tags; every other action is pinned to a commit SHA (enforced by `.github/zizmor.yml`) with a `# vX.Y.Z` comment (pinact keeps it current; see CONTRIBUTING "GitHub Actions"). Every workflow sets `permissions: {}` and grants per job; checkouts set `persist-credentials: false`.

These commands change as the uplift lands. Update this section in the same PR that changes them.

## Code conventions

- **`index.js` stays ES5 in 3.x:** `var`, `function`, no arrow functions, spread, `for...of` or other ES2015+ syntax, and no lint autofixes that introduce them. Map/Set iteration is hand-lowered on purpose. Tests, benchmarks and scripts are modern ESM.
- **Keep the `// START:` / `// END:` comment blocks in `index.js`.** They mark which lines are `fast-deep-equal` (and which version), which are our modifications to it, and which are `react-fast-compare`'s own; they're how upstream changes are merged (CONTRIBUTING). Put new code in the right block, and leave upstream lines as close to upstream as possible.
- **Types come from JSDoc** (`checkJs`, `strict`); there's no TypeScript source and no build step. Fix type errors with JSDoc annotations or `/** @type */` casts, never runtime changes. `index.d.ts` is still hand-written in 3.x and must match 3.2.2 byte for byte; `types:check` fails if the JSDoc drifts from it. Add a probe case in `test/types/` for any usage the types must keep supporting.
- Any change to the published output (beyond formatting/comments in `index.js`) fails `pack:check` until `pnpm pack:check --update` regenerates `pack-snapshot.json`. Do that only for an intended change, with a changeset, and call it out in the PR.
- Match the surrounding code's style, naming, and comment density.
- Don't add an `engines` field. `.nvmrc` is the one place the Node version is set.
- Scripts and tooling: prefer async Node APIs (`node:fs/promises`, top-level `await`) over `*Sync` functions unless async can't work or clearly complicates a step; say why in a comment.

## Keep tuning

- **Speed is the library's pitch.** If a change touches the comparison code, run `pnpm bench` before and after, and mention differences beyond ~3–5% in the PR (smaller ones are noise; see CONTRIBUTING "Benchmarks").
- **Size:** `pnpm size` is reported in CI, not gated. Note min+gz growth in the PR.
- **This file:** if an agent gets something wrong because guidance was missing or stale, fix the guidance here.

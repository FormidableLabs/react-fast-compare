// npm-check-updates config for `pnpm dep:check` (see CONTRIBUTING.md).
module.exports = {
  // Skip versions published in the last week (matches pnpm's
  // `minimumReleaseAge` in `pnpm-workspace.yaml`).
  cooldown: 7,
};

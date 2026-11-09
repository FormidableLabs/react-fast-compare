import path from 'node:path';

import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type Plugin } from 'vitest/config';

// The same specs (`test/*.spec.mjs`) run in two projects:
// - `node`: Node, with jsdom for the specs that need a DOM (they say so in a
//   `@vitest-environment` comment).
// - `browser`: Vitest browser mode in headless Chromium, Firefox and WebKit.
//   Install the browsers once with
//   `pnpm exec playwright install --only-shell chromium firefox webkit`.

// CommonJS files the specs import: `index.js` (published as is) and
// fast-deep-equal's vendored fixtures. Node loads them natively, but browser
// mode serves files as ES modules. They only assign `module.exports`, so the
// browser project wraps them, on the first line to keep line numbers.
const COMMONJS = new Set(
  [
    'index.js',
    'test/fixtures/fast-deep-equal/tests.js',
    'test/fixtures/fast-deep-equal/es6tests.js',
  ].map((file) => path.resolve(import.meta.dirname, file))
);

const commonjs = (): Plugin => ({
  name: 'commonjs',
  transform(code, id) {
    if (!COMMONJS.has(path.resolve(id))) return;
    return {
      code: `var module = { exports: {} };${code}\nexport default module.exports;\n`,
      map: null,
    };
  },
});

export default defineConfig({
  test: {
    include: ['test/*.spec.mjs'],
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: { name: 'node' },
      },
      {
        extends: true,
        plugins: [commonjs()],
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
              { browser: 'firefox' },
              { browser: 'webkit' },
            ],
            screenshotFailures: false,
          },
        },
      },
    ],
    // `pnpm bench`: `bench/*.bench.mjs` run only under `vitest bench`, which
    // adds a "<project> (bench)" project for each project above. The script
    // picks `node (bench)`.
    benchmark: {
      include: ['bench/*.bench.mjs'],
    },
    // `pnpm test --project node --coverage` (CI's Coverage step). v8 coverage
    // only works in Node and Chromium, so the browser project doesn't run it.
    coverage: {
      provider: 'v8',
      include: ['index.js'],
      reporter: ['text', ['text-summary', { file: 'summary.txt' }]],
    },
  },
});

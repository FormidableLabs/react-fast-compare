// Self-regression benchmark (`pnpm bench`): this tree vs. the last published
// version vs. fast-deep-equal, the upstream we forked from. One benchmark per
// fixture group; each operation compares every case in the group once.
//
// A candidate that throws on any case in a group is left out of that group
// (and named in the test title): timing exceptions would swamp the numbers.
// Correctness is the tests' job, not this file's.
import { test } from 'vitest';

import fastDeepEqual from 'fast-deep-equal/es6/react.js';
import published from 'react-fast-compare-published';

import equal from '../index.js';
import * as fixtures from '../test/fixtures/index.mjs';

// `published` is an aliased devDependency on the last release; bump it after
// each release (see CONTRIBUTING).
const CANDIDATES = {
  'this tree': equal,
  published,
  'fast-deep-equal': fastDeepEqual,
};

const GROUPS = {
  generic: fixtures.generic,
  es6: fixtures.es6,
  react: fixtures.react,
  custom: fixtures.custom,
};

const throws = (fn, cases) =>
  cases.some(({ value1, value2 }) => {
    try {
      fn(value1, value2);
      return false;
    } catch {
      return true;
    }
  });

for (const [group, suites] of Object.entries(GROUPS)) {
  const cases = suites.flatMap((suite) => suite.tests);
  const candidates = Object.entries(CANDIDATES);
  const skipped = candidates.filter(([, fn]) => throws(fn, cases));
  const title = skipped.length
    ? `${group} (${skipped.map(([name]) => name).join(', ')} skipped: throws)`
    : group;

  test(title, async ({ bench }) => {
    await bench.compare(
      ...candidates
        .filter((candidate) => !skipped.includes(candidate))
        .map(([name, fn]) =>
          bench(name, () => {
            for (const { value1, value2 } of cases) fn(value1, value2);
          })
        )
    );
  });
}

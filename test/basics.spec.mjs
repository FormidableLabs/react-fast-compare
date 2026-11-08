import { beforeEach, describe, expect, it, vi } from 'vitest';

import equal from '../index.js';
import * as tests from './fixtures/index.mjs';

describe('basics', () => {
  beforeEach(() => {
    // Circular references warn; that's covered under "warnings" below.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  for (const suite of tests.all) {
    describe(suite.description, () => {
      for (const test of suite.tests) {
        it.skipIf(test.skip)(test.description, () => {
          expect(equal(test.value1, test.value2)).toBe(test.equal);
        });
      }
    });
  }
});

describe('warnings', () => {
  let warn;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('warns on circular refs but does not throw', () => {
    const circularA = { a: 1 };
    circularA.self = circularA;
    const circularB = { a: 1 };
    circularB.self = circularB;
    equal(circularA, circularB);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('never warns on the generic cases', () => {
    for (const suite of tests.generic) {
      for (const test of suite.tests) {
        expect(equal(test.value1, test.value2), test.description).toBe(
          test.equal
        );
      }
    }
    expect(warn).not.toHaveBeenCalled();
  });
});

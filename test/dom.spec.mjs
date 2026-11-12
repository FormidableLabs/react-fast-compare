// @vitest-environment jsdom
// (Node project only; the browser project has a real DOM.)
import { describe, expect, it } from 'vitest';

import equal from '../index.js';

describe('DOM elements', () => {
  const element1 = document.createElement('div');
  const element2 = document.createElement('div');
  const element3 = document.createElement('input');

  it('equal DOM elements', () => {
    expect(equal(element1, element1)).toBe(true);
  });

  it('comparison of different elements', () => {
    expect(equal(element1, element2)).toBe(false);
  });

  it('comparison of elements with different types', () => {
    expect(equal(element1, element3)).toBe(false);
  });
});

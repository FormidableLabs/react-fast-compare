// Type probe: a CommonJS consumer (`.cts`). Both import forms must give 3.2.2's
// signature. The usage cases are in `probe.mts`.
import isEqualRequire = require('react-fast-compare');
import isEqualDefault from 'react-fast-compare';
import type { Equals, Signature } from './signature.js';

export const requireOk: Equals<typeof isEqualRequire, Signature> = true;
export const defaultOk: Equals<typeof isEqualDefault, Signature> = true;
export const result: boolean = isEqualRequire({ a: 1 }, { a: 1 });

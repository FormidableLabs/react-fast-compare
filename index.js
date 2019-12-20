'use strict';

var isArray = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;
var hasElementType = typeof Element !== 'undefined';

function equal(a, b) {
  // fast-deep-equal index.js 2.0.1
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var i;

    if (isArray(a)) {
      if (!isArray(b)) return false;
      if (a.length !== b.length) return false;
      i = a.length;
      while (i--) if (!equal(a[i], b[i])) return false;
      return true;
    } else if (isArray(b)) {
      return false;
    }

    if (a instanceof Date) {
      if (!(b instanceof Date)) return false;
      return a.getTime() == b.getTime();
    } else if (b instanceof Date) {
      return false;
    }

    if (a instanceof RegExp) {
      if (!(b instanceof RegExp)) return false;
      return a.toString() == b.toString();
    } else if (b instanceof RegExp) {
      return false;
    }

    var keys = keyList(a);

    if (keys.length !== keyList(b).length) return false;

    i = keys.length;

    while (i--) if (!hasProp.call(b, keys[i])) return false;
    // end fast-deep-equal

    // start react-fast-compare
    // custom handling for DOM elements
    if (hasElementType && a instanceof Element) return false;

    // custom handling for React
    i = keys.length;

    while (i--) {
      // React-specific: avoid traversing React elements' _owner.
      //  _owner contains circular references
      // and is not needed when comparing the actual elements (and not their owners)
      // .$$typeof and ._store on just reasonable markers of a react element
      if (keys[i] === '_owner' && a.$$typeof) continue;

      // all other properties should be traversed as usual
      if (!equal(a[keys[i]], b[keys[i]])) return false;
    }
    // end react-fast-compare

    // fast-deep-equal index.js 2.0.1
    return true;
  }

  return a !== a && b !== b;
}
// end fast-deep-equal

module.exports = function exportedEqual(a, b) {
  try {
    return equal(a, b);
  } catch (error) {
    if ((error.message && error.message.match(/stack|recursion/i)) || (error.number === -2146828260)) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      console.warn('Warning: react-fast-compare does not handle circular references.', error.name, error.message);
      return false;
    }
    // some other error. we should definitely know about these
    throw error;
  }
};

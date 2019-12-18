'use strict';

// Polyfills for IE9 in React 16.
require('core-js/features/map');
require('core-js/features/set');
require('core-js/features/weak-map');

// Re-use node tests.
const testsContext = require.context('..', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

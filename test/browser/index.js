'use strict';

// Polyfills for IE9 in React 16.
require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/es6/weak-map');

// Re-use node tests.
const testsContext = require.context('..', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

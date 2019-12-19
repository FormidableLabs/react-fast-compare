'use strict';

// Polyfills for IE in React 16.
require('core-js/features/map');
require('core-js/features/set');
require('core-js/features/weak-map');
require('core-js/features/symbol');

// Re-use node tests.
const testsContext = require.context('..', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

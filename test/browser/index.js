'use strict';

// Re-use node tests.
const testsContext = require.context('../node', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

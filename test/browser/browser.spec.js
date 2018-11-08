'use strict';

var assert = require('assert');
var sinon = require('sinon');

var equal = require('../..');

const element1 = document.createElement('div');
const element2 = document.createElement('div');
const element3 = document.createElement('input');

const suites = [{
  description: 'DOM elements',
  tests: [
    {
      description: 'equal DOM elements',
      value1: element1,
      value2: element1,
      equal: true
    },
    {
      description: 'comparison of different elements',
      value1: element1,
      value2: element2,
      equal: false
    },
    {
      description: 'comparison of elements with different types',
      value1: element1,
      value2: element3,
      equal: false
    },
  ]
}];

describe('browser', function () {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(console, 'warn');
  });

  afterEach(() => {
    sandbox.restore();
  });

  suites.forEach(function (suite) {
    describe(suite.description, function () {
      suite.tests.forEach(function (test) {
        it(test.description, function () {
          assert.strictEqual(equal(test.value1, test.value2), test.equal);
        });
      });
    });
  });
});

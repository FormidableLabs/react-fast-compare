'use strict';

const assert = require('assert');
const sinon = require('sinon');

const equal = require('../..');
const tests = require('./tests');

describe('basics', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'warn');
  });

  afterEach(() => {
    sandbox.restore();
  });

  tests.all.forEach(function (suite) {
    describe(suite.description, function() {
      suite.tests.forEach(function (test) {
        (test.skip ? it.skip : it)(test.description, function() {
          assert.strictEqual(equal(test.value1, test.value2), test.equal);
        });
      });
    });
  });
});

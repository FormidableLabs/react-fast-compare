'use strict';

const assert = require('assert');
const jsdom = require('jsdom-global');
const sinon = require('sinon');

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');

const Preact = require('preact/compat');
const PreactTestRenderer = require('@testing-library/preact');

const equal = require('../..');
const tests = require('./tests');

class ReactChild extends React.Component {
  shouldComponentUpdate(nextProps) {
    // this.props.children is a h1 with a circular reference to its owner, Container
    return !equal(this.props, nextProps);
  }
  render() {
    return null;
  }
}

class ReactContainer extends React.Component {
  render() {
    return React.createElement(ReactChild, {
      children: [
        React.createElement('h1', this.props.title || ''),
        React.createElement('h2', this.props.subtitle || ''),
      ],
    });
  }
}

class PreactChild extends Preact.Component {
  shouldComponentUpdate(nextProps) {
    // this.props.children is a h1 with a circular reference to its owner, Container
    return !equal(this.props, nextProps);
  }
  render() {
    return null;
  }
}

class PreactContainer extends Preact.Component {
  render() {
    return Preact.createElement(PreactChild, {
      children: [
        Preact.createElement('h1', this.props.title || ''),
        Preact.createElement('h2', this.props.subtitle || ''),
      ],
    });
  }
}

describe('advanced', () => {
  let sandbox;
  let warnStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    warnStub = sandbox.stub(console, 'warn');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('React', () => {
    let reactChildRenderSpy;

    beforeEach(() => {
      reactChildRenderSpy = sandbox.spy(ReactChild.prototype, 'render');
    });

    describe('element (with circular references)', () => {
      it('compares without warning or errors', () => {
        const reactApp = ReactTestRenderer.create(
          React.createElement(ReactContainer)
        );
        reactApp.update(React.createElement(ReactContainer));
        assert.strictEqual(warnStub.callCount, 0);
      });
      it('elements of same type and props are equal', () => {
        const reactApp = ReactTestRenderer.create(
          React.createElement(ReactContainer)
        );
        reactApp.update(React.createElement(ReactContainer));
        assert.strictEqual(reactChildRenderSpy.callCount, 1);
      });
      it('elements of same type with different props are not equal', () => {
        const reactApp = ReactTestRenderer.create(
          React.createElement(ReactContainer)
        );
        reactApp.update(React.createElement(ReactContainer, { title: 'New' }));
        assert.strictEqual(reactChildRenderSpy.callCount, 2);
      });
    });
  });

  describe('Preact', () => {
    let cleanupJsDom;
    let preactChildRenderSpy;

    beforeEach(() => {
      cleanupJsDom = jsdom();
      preactChildRenderSpy = sandbox.spy(PreactChild.prototype, 'render');
    });

    afterEach(() => {
      PreactTestRenderer.cleanup();
      if (cleanupJsDom) cleanupJsDom();
    });

    describe('element (with circular references)', () => {
      it('compares without warning or errors', () => {
        const { rerender } = PreactTestRenderer.render(
          Preact.createElement(PreactContainer)
        );
        rerender(Preact.createElement(PreactContainer));
        assert.strictEqual(warnStub.callCount, 0);
      });
      it('elements of same type and props are equal', () => {
        const { rerender } = PreactTestRenderer.render(
          Preact.createElement(PreactContainer)
        );
        rerender(Preact.createElement(PreactContainer));
        assert.strictEqual(preactChildRenderSpy.callCount, 1);
      });
      it('elements of same type with different props are not equal', () => {
        const { rerender } = PreactTestRenderer.render(
          Preact.createElement(PreactContainer)
        );
        rerender(Preact.createElement(PreactContainer, { title: 'New' }));
        assert.strictEqual(preactChildRenderSpy.callCount, 2);
      });
    });
  });

  describe('warnings', () => {
    describe('circular reference', () => {
      it('warns on circular refs but do not throw', () => {
        const circularA = { a: 1 };
        circularA.self = circularA;
        const circularB = { a: 1 };
        circularB.self = circularB;
        equal(circularA, circularB);
        assert.strictEqual(warnStub.callCount, 1);
      });
    });
    describe('basics usage', () => {
      it('never warns', () => {
        tests.generic.forEach((suite) => {
          suite.tests.forEach((test) => {
            assert.strictEqual(
              equal(test.value1, test.value2),
              test.equal,
              test.description
            );
          });
        });
        assert.strictEqual(
          warnStub.callCount,
          0,
          `console.warn called ${
            warnStub.callCount
          } with arguments: ${JSON.stringify(warnStub.args)}`
        );
      });
    });
  });
});

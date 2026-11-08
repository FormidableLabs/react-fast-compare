// @vitest-environment jsdom
// (Node project only; the browser project has a real DOM.)
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as Preact from 'preact/compat';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import equal from '../index.js';

/* eslint-disable react/no-children-prop */

// A child that re-renders only when `equal` says its props changed. Its
// children are elements created in the container's render, so in development
// builds their `_owner` points back into the renderer: circular references
// that `equal` has to skip.
function createComponents(lib) {
  class Child extends lib.Component {
    shouldComponentUpdate(nextProps) {
      return !equal(this.props, nextProps);
    }
    render() {
      return null;
    }
  }

  class Container extends lib.Component {
    render() {
      return lib.createElement(Child, {
        children: [
          lib.createElement('h1', null, this.props.title || ''),
          lib.createElement('h2', null, this.props.subtitle || ''),
        ],
      });
    }
  }

  return { Child, Container };
}

// Synchronous renders, so the assertions see the result without `act()`.
const renderers = {
  React: (container) => {
    const root = createRoot(container);
    return {
      render: (element) => flushSync(() => root.render(element)),
      unmount: () => root.unmount(),
    };
  },
  Preact: (container) => ({
    render: (element) => Preact.render(element, container),
    unmount: () => Preact.render(null, container),
  }),
};

describe.each([
  ['React', React],
  ['Preact', Preact],
])('%s element (with circular references)', (name, lib) => {
  const { Child, Container } = createComponents(lib);
  let renderer;
  let childRender;
  let warn;
  let error;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn');
    error = vi.spyOn(console, 'error');
    childRender = vi.spyOn(Child.prototype, 'render');
    renderer = renderers[name](document.createElement('div'));
    renderer.render(lib.createElement(Container));
  });

  afterEach(() => {
    renderer.unmount();
  });

  it('compares without warning or errors', () => {
    renderer.render(lib.createElement(Container));
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('elements of same type and props are equal', () => {
    renderer.render(lib.createElement(Container));
    expect(childRender).toHaveBeenCalledTimes(1);
  });

  it('elements of same type with different props are not equal', () => {
    renderer.render(lib.createElement(Container, { title: 'New' }));
    expect(childRender).toHaveBeenCalledTimes(2);
  });
});

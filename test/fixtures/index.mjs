import generic from './fast-deep-equal/tests.js';
import es6 from './fast-deep-equal/es6tests.js';

const reactElementA = {
  $$typeof: 'react.element',
  type: 'div',
  key: null,
  ref: null,
  props: { x: 1 },
  _owner: {},
  _store: {},
};
// in reality the _owner object is much more complex (and contains over dozen circular references)
reactElementA._owner.children = [reactElementA];

const reactElementA2 = {
  $$typeof: 'react.element',
  type: 'div',
  key: null,
  ref: null,
  props: { x: 1 },
  _owner: {},
  _store: {},
};
reactElementA2._owner.children = [reactElementA2];

const reactElementB = {
  $$typeof: 'react.element',
  type: 'div',
  key: null,
  ref: null,
  props: { x: 2 },
  _owner: {},
  _store: {},
};
reactElementB._owner.children = [reactElementB];

const react = [
  {
    description: 'React elements',
    reactSpecific: true,
    tests: [
      {
        description: 'an element compared with itself',
        value1: reactElementA,
        value2: reactElementA,
        equal: true,
      },
      {
        description: 'two elements equal by value',
        value1: reactElementA,
        value2: reactElementA2,
        equal: true,
      },
      {
        description: 'two elements unequal by value',
        value1: reactElementA,
        value2: reactElementB,
        equal: false,
      },
    ],
  },
];

// Additional customized behavior.
const custom = [
  {
    description: 'Custom tests',
    tests: [
      {
        description: 'Object.create(null) equal',
        value1: Object.create(null),
        value2: Object.create(null),
        equal: true,
      },
      {
        description: 'Object.create(null) unequal to empty object',
        value1: Object.create(null),
        value2: {},
        equal: false,
      },
      {
        description: 'Object.create(null) unequal to non-empty object',
        value1: Object.create(null),
        value2: { a: 1 },
        equal: false,
      },
      // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#null-prototype_objects
      {
        description:
          'Object.create(null) equal to vanilla null prototype deep objects',
        value1: Object.assign(Object.create(null), { a: 1, b: { c: true } }),
        value2: { __proto__: null, a: 1, b: { c: true } },
        equal: true,
      },
      // Object.create(null) has a different `constructor` than a vanilla, non-null object.
      {
        description: 'Object.create(null) unequal to vanilla deep objects',
        value1: Object.assign(Object.create(null), { a: 1, b: { c: true } }),
        value2: { a: 1, b: { c: true } },
        equal: false,
      },
      {
        description: 'Object.create(null) equal for deep objects',
        value1: Object.assign(Object.create(null), { a: 1, b: { c: true } }),
        value2: Object.assign(Object.create(null), { b: { c: true }, a: 1 }),
        equal: true,
      },
    ],
  },
];

// A `DataView` over the given bytes. Comparing it through the typed-array loop
// (#150) reads `view[NaN]` forever. The trap turns that hang into a throw, so a
// regression fails the tests instead of stalling them (a synchronous loop can't
// be timed out), and `pnpm bench` skips versions that still have the bug.
const dataView = (bytes) => {
  const view = new DataView(new Uint8Array(bytes).buffer);
  Object.defineProperty(view, 'NaN', {
    get() {
      throw new Error('DataView compared as a typed array (#150)');
    },
  });
  return view;
};

const dataViews = [
  {
    description: 'DataView',
    tests: [
      {
        description: 'empty DataViews are equal',
        value1: dataView([]),
        value2: dataView([]),
        equal: true,
      },
      {
        description: 'DataViews with the same bytes are equal',
        value1: dataView([1, 2, 3, 4]),
        value2: dataView([1, 2, 3, 4]),
        equal: true,
      },
      {
        description: 'DataViews with different bytes are not equal',
        value1: dataView([1, 2, 3, 4]),
        value2: dataView([1, 2, 3, 5]),
        equal: false,
      },
      {
        description: 'DataViews with different lengths are not equal',
        value1: dataView([1, 2, 3, 4]),
        value2: dataView([1, 2, 3]),
        equal: false,
      },
      {
        description: 'objects with equal DataViews are equal',
        value1: { a: 1, view: dataView([1, 2, 3, 4]) },
        value2: { a: 1, view: dataView([1, 2, 3, 4]) },
        equal: true,
      },
      {
        description: 'objects with different DataViews are not equal',
        value1: { a: 1, view: dataView([1, 2, 3, 4]) },
        value2: { a: 1, view: dataView([4, 3, 2, 1]) },
        equal: false,
      },
    ],
  },
];

export { generic, es6, react, custom, dataViews };
export const all = [].concat(generic, es6, react, custom, dataViews);

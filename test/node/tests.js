'use strict';
const generic = require('fast-deep-equal-git/spec/tests.js');
const es6 = require('fast-deep-equal-git/spec/es6tests.js');

const reactElementA = {
  '$$typeof': 'react.element',
  type: 'div',
  key: null,
  ref: null,
  props: { x: 1 },
  _owner: {},
  _store: {}
};
// in reality the _owner object is much more complex (and contains over dozen circular references)
reactElementA._owner.children = [reactElementA];

const reactElementA2 = {
  '$$typeof': 'react.element',
  type: 'div',
  key: null,
  ref: null,
  props: { x: 1 },
  _owner: {},
  _store: {}
};
reactElementA2._owner.children = [reactElementA2];

const reactElementB = {
  '$$typeof': 'react.element',
  type: 'div',
  key: null,
  ref: null,
  props: { x: 2 },
  _owner: {},
  _store: {}
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
        equal: true
      },
      {
        description: 'two elements equal by value',
        value1: reactElementA,
        value2: reactElementA2,
        equal: true
      },
      {
        description: 'two elements unequal by value',
        value1: reactElementA,
        value2: reactElementB,
        equal: false
      }
    ]
  }
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
        equal: true
      },
      {
        description: 'Object.create(null) unequal to empty object',
        value1: Object.create(null),
        value2: {},
        equal: false
      },
      {
        description: 'Object.create(null) unequal to non-empty object',
        value1: Object.create(null),
        value2: { a: 1 },
        equal: false
      },
      {
        description: 'Object.create(null) equal to vanilla deep objects',
        value1: Object.assign(Object.create(null), { a: 1, b: { c: true } }),
        value2: { a: 1, b: { c: true } },
        equal: false
      },
      {
        description: 'Object.create(null) equal for deep objects',
        value1: Object.assign(Object.create(null), { a: 1, b: { c: true } }),
        value2: Object.assign(Object.create(null), { b: { c: true }, a: 1 }),
        equal: true
      }
    ]
  }
];

module.exports = {
  generic,
  es6,
  react,
  custom,
  all: [].concat(generic, es6, react, custom),
};

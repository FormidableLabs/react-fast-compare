'use strict';
var generic = require('fast-deep-equal-git/spec/tests.js');
var es6 = require('fast-deep-equal-git/spec/es6tests.js');

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

module.exports = {
  generic,
  es6,
  react,
  all: [...generic, ...es6, ...react],
};

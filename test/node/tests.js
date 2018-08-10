'use strict';
var generic = require('./fast-deep-equal-tests.js');

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

const element1 = document.createElement('div');
const element2 = document.createElement('div');
const element3 = document.createElement('input');

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

const domElements = [{
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

module.exports = {
  generic,
  react,
  all: [...generic, ...react, ...domElements],
};

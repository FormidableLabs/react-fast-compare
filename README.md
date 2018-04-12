# react-fast-compare

The fastest deep equal comparison for React, perfect for `shouldComponentUpdate`, also really fast at general-purpose deep comparison. This is a fork of the brilliant [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal) with some extra handling for React. 

[![Build Status](https://travis-ci.org/FormidableLabs/react-fast-compare.svg?branch=master)](https://travis-ci.org/FormidableLabs/react-fast-compare)
[![npm version](https://badge.fury.io/js/react-fast-compare.svg)](http://badge.fury.io/js/react-fast-compare)

<img src="https://i.imgur.com/KLUWQla.png" alt="chart" width="500"/>

[benchmarking details](#Benchmarking)

## Install

```bash
yarn add react-fast-compare
# or
npm install react-fast-compare
```


## Features

- ES5 compatible; works in node.js (0.10+) and browsers (IE9+)
- deeply compares any object (besides circular references)
- handles all React-specific circular references, like elements
- checks equality Date and RegExp objects

## Usage

```jsx
const isEqual = require('react-fast-compare');

// general usage
console.log(isEqual({foo: 'bar'}, {foo: 'bar'})); // true

// react usage
class ExpensiveRenderer extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }
  render() {
    // ...
  }
}
```

## Benchmarking

All tests carried out locally on a Macbook. The absolute values are much less important than the relative differences between packages.

Benchmarking [source code](https://github.com/FormidableLabs/react-fast-compare/blob/master/spec/tests.js). React tests use both the generic tests and the react tests.

### Generic Data

```
react-fast-compare x 161,872 ops/sec ±1.18% (82 runs sampled)
fast-deep-equal x 159,889 ops/sec ±1.62% (85 runs sampled)
lodash.isEqual x 30,750 ops/sec ±2.02% (86 runs sampled)
nano-equal x 35,608 ops/sec ±1.55% (86 runs sampled)
shallow-equal-fuzzy x 94,141 ops/sec ±1.80% (89 runs sampled)
  fastest: react-fast-compare,fast-deep-equal
```


### React and Generic Data

```
react-fast-compare x 150,667 ops/sec ±1.86% (83 runs sampled)
fast-deep-equal x 510 ops/sec ±1.67% (77 runs sampled)
lodash.isEqual x 25,760 ops/sec ±1.63% (83 runs sampled)
nano-equal x 629 ops/sec ±2.43% (80 runs sampled)
shallow-equal-fuzzy x 454 ops/sec ±1.42% (79 runs sampled)
  fastest: react-fast-compare
```

To run benchmarks locally:

```bash
yarn install
yarn run benchmark
```


## License

[MIT](https://github.com/epoberezkin/fast-deep-equal/blob/master/LICENSE)

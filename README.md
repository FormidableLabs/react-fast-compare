[![React Fast Compare — Nearform](https://oss.nearform.com/api/banner.svg?badge=react-fast-compare&bg=2f8f83)](https://nearform.com/open-source/)

[![Downloads][downloads_img]][npm_site]
[![GH Actions Status][actions_img]][actions_site]
[![npm version][npm_img]][npm_site]
[![Maintenance Status][maintenance_img]](#maintenance-status)

The fastest deep equal comparison for React. Very quick general-purpose deep
comparison, too. Great for `React.memo` and `shouldComponentUpdate`.

This is a fork of the brilliant
[fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal) with some
extra handling for React.

## Install

```sh
$ npm install react-fast-compare
```

## Highlights

- ES5 compatible; works in node.js (0.10+) and browsers (IE9+)
- deeply compares any value (besides objects with circular references)
- handles React-specific circular references, like elements
- checks equality of Date and RegExp objects
- should be as fast as [fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal) via a single unified library, and with added guardrails for circular references.
- small: under 660 bytes minified+gzipped

## Usage

```jsx
const isEqual = require('react-fast-compare');

// general usage
console.log(isEqual({ foo: 'bar' }, { foo: 'bar' })); // true

// React.memo
// only re-render ExpensiveComponent when the props have deeply changed
const DeepMemoComponent = React.memo(ExpensiveComponent, isEqual);

// React.Component shouldComponentUpdate
// only re-render AnotherExpensiveComponent when the props have deeply changed
class AnotherExpensiveComponent extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }
  render() {
    // ...
  }
}
```

## Do I Need `React.memo` (or `shouldComponentUpdate`)?

> What's faster than a really fast deep comparison? No deep comparison at all.

—This Readme

Deep checks in `React.memo` or a `shouldComponentUpdate` should not be used blindly.
First, see if the default
[React.memo](https://react.dev/reference/react/memo) or
[PureComponent](https://react.dev/reference/react/PureComponent)
will work for you. If it won't (if you need deep checks), it's wise to make
sure you've correctly identified the bottleneck in your application by
[profiling the performance](https://react.dev/reference/react/Profiler).
After you've determined that you _do_ need deep equality checks and you've
identified the minimum number of places to apply them, then this library may
be for you!

## Benchmarking this Library

`react-fast-compare` is based on `fast-deep-equal`, and aims to be as fast on
generic data while also handling React elements. The benchmark
([`bench/`](./bench/compare.bench.mjs), Vitest's
[benchmarking](https://vitest.dev/guide/benchmarking)) compares this code with
the last published version and with `fast-deep-equal`, over the same test cases
the tests use:

```sh
$ pnpm install
$ pnpm bench
```

Absolute numbers depend on the machine; compare rows from the same run. CI adds
the results to the job summary of each run.

## Differences between this library and `fast-deep-equal`

`react-fast-compare` is based on `fast-deep-equal`, with some additions:

- `react-fast-compare` has `try`/`catch` guardrails for stack overflows from undetected (non-React) circular references.
- `react-fast-compare` has a _single_ unified entry point for all uses. No matter what your target application is, `import equal from 'react-fast-compare'` just works. `fast-deep-equal` has multiple entry points for different use cases.

This version of `react-fast-compare` tracks `fast-deep-equal@3.1.3`.

## Bundle Size

There are a variety of ways to calculate bundle size for JavaScript code.
`pnpm size` ([`scripts/size.mjs`](./scripts/size.mjs)) minifies `index.js` with
terser, mangling top-level names, and reports the raw, minified, gzip and
brotli sizes. CI adds the same report to each run's job summary.
[Bundlephobia's calculation](https://bundlephobia.com/result?p=react-fast-compare) is slightly higher,
as they [do not mangle during minification](https://github.com/pastelsky/package-build-stats/blob/v6.1.1/src/getDependencySizeTree.js#L139).

## License

[MIT](./LICENSE)

## Contributing

Please see our [contributions guide](./CONTRIBUTING.md).

## Maintenance Status

**Active:** Nearform is actively working on this project, and we expect to continue work for the foreseeable future. Bug reports, feature requests and pull requests are welcome.

[actions_img]: https://github.com/FormidableLabs/react-fast-compare/actions/workflows/ci.yml/badge.svg
[actions_site]: https://github.com/FormidableLabs/react-fast-compare/actions/workflows/ci.yml
[npm_img]: https://img.shields.io/npm/v/react-fast-compare.svg
[npm_site]: https://www.npmjs.com/package/react-fast-compare
[downloads_img]: https://img.shields.io/npm/dm/react-fast-compare.svg
[maintenance_img]: https://img.shields.io/badge/maintenance-active-green.svg

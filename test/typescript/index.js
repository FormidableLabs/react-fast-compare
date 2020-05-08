// Test file for types in typescript!
// =============
// An example of `equal` usage that currently breaks:
// https://github.com/FormidableLabs/react-fast-compare/issues/61
// @types/react-redux/index.d.ts
// export function useSelector<TState, TSelected>(
//   selector: (state: TState) => TSelected,
//   equalityFn?: (left: TSelected, right: TSelected) => boolean
// ): TSelected;
// =============
// `a.default is not a function`
// // https://github.com/FormidableLabs/react-fast-compare/pulls/62
// Test usage of this module elsewhere? Or push a release and hope the upstream is fixed?

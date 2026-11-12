// Type probe: an ES module consumer (`.mts`), with the ways people use
// `isEqual`. `pnpm pack:check` compiles it against the packed tarball.
import * as React from 'react';
import isEqual from 'react-fast-compare';
import type { Equals, Signature } from './signature.js';

export const defaultOk: Equals<typeof isEqual, Signature> = true;

type Props = { id: string; text: string };

// `React.memo` comparison function.
const Item = (props: Props) => props.text;
export const MemoItem = React.memo(Item, isEqual);

// `shouldComponentUpdate`.
export class ItemClass extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    return this.props.text;
  }
}

// Equality callbacks shaped `(a: T, b: T) => boolean`, as in react-redux's
// `useSelector` or zustand's `useStoreWithEqualityFn`.
declare function useSelector<S, T>(
  selector: (state: S) => T,
  equalityFn?: (a: T, b: T) => boolean
): T;
export const count: number = useSelector(
  (state: { items: string[] }) => state.items.length,
  isEqual
);

// A `false` result doesn't narrow `prev` to `never` (#130).
export function changedText(prev: Props, next: Props): string | null {
  if (isEqual(prev, next)) return null;
  return prev.text;
}

// @ts-expect-error: returns `boolean`, not a string.
export const notString: string = isEqual(1, 2);

// @ts-expect-error: takes two arguments.
export const oneArg = isEqual(1);

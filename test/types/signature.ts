// What every consumer must see for `isEqual`, however it imports it: 3.2.2's
// signature. A type guard (`a is B`, #130) or a narrower return type fails.
export type Signature = <A = any, B = any>(a: A, b: B) => boolean;

// `true` only if X and Y are the same type.
export type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

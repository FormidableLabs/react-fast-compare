# Changelog

## UNRELEASED

**Features:**
- Update library to include ES.next support for `Map`, `Set`, `ArrayBuffer`. [#36](https://github.com/FormidableLabs/react-fast-compare/pull/36).

**Breaking changes:**
- Update to `fast-deep-equal@3.1.1` with modified support for ES.next data types.

**Infrastructure:**
- Upgrade lots of `devDependenices`
- Use `fast-deep-equal` tests directly in our correctness tests.
- Update CI to modern Node.js versions.

## 2.0.4 (2018-11-09)

- [#39](https://github.com/FormidableLabs/react-fast-compare/pull/39). Fix `react-native` bug introduced by DOM element checking.

## 2.0.3 (2018-11-08)

- [#33](https://github.com/FormidableLabs/react-fast-compare/pull/33). Add handling for DOM elements. Thanks @viper1104!

## 2.0.2 (2018-08-21)

- [#28](https://github.com/FormidableLabs/react-fast-compare/pull/28). Fix for localized versions of IE11. Thanks @excentrik!
- [#34](https://github.com/FormidableLabs/react-fast-compare/pull/34). Fix typo. Thanks @Marviel!

## 2.0.1 (2018-06-25)

- [#26](https://github.com/FormidableLabs/react-fast-compare/pull/26). Remove `_store` check. Thanks @chen-ye!

**Major bugfix:** Fixes `RangeError` in production, [#25](https://github.com/FormidableLabs/react-fast-compare/issues/25)

## 2.0.0 (2018-06-04)

- [#21](https://github.com/FormidableLabs/react-fast-compare/pull/21). Upgrade to `fast-deep-equal@2.0.1`. Thanks @samwhale!

**Breaking changes:**
- `null` and `Object` comparison
- new behavior: functions are no longer treated as equal
- new behavior: handle `NaN`

## 1.0.0 (2018-04-12)

- Initial release. forked from `fast-deep-equal@1.1.0`

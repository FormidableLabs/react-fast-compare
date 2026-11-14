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
      // `valueOf` overrides still compare by `valueOf()` after the Temporal
      // check (#139). `Date#toString()` drops milliseconds, so a `toString()`
      // comparison would make these equal.
      {
        description: 'Dates 1 ms apart are not equal',
        value1: new Date(0),
        value2: new Date(1),
        equal: false,
      },
      {
        description: 'equal boxed Numbers are equal',
        value1: new Number(1),
        value2: new Number(1),
        equal: true,
      },
      {
        description: 'different boxed Strings are not equal',
        value1: new String('a'),
        value2: new String('b'),
        equal: false,
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

// Temporal (#139). Its `valueOf()` throws by design, so these throw in 3.2.2
// and fast-deep-equal. Every engine we test has it built in; where it's
// missing, the cases are skipped instead of polyfilled.
const { Temporal } = globalThis;
const temporalCase = (description, value1, value2, equal) =>
  Temporal
    ? { description, value1: value1(), value2: value2(), equal }
    : { description, equal, skip: true };

const temporal = [
  {
    description: 'Temporal',
    tests: [
      temporalCase(
        'equal PlainDates are equal',
        () => Temporal.PlainDate.from('2026-11-13'),
        () => Temporal.PlainDate.from('2026-11-13'),
        true
      ),
      temporalCase(
        'different PlainDates are not equal',
        () => Temporal.PlainDate.from('2026-11-13'),
        () => Temporal.PlainDate.from('2026-11-14'),
        false
      ),
      temporalCase(
        'PlainDates with different calendars are not equal',
        () => Temporal.PlainDate.from('2026-11-13'),
        () => Temporal.PlainDate.from('2026-11-13[u-ca=hebrew]'),
        false
      ),
      temporalCase(
        'equal PlainTimes are equal',
        () => Temporal.PlainTime.from('07:00'),
        () => Temporal.PlainTime.from('07:00'),
        true
      ),
      temporalCase(
        'different PlainTimes are not equal',
        () => Temporal.PlainTime.from('07:00'),
        () => Temporal.PlainTime.from('08:00'),
        false
      ),
      temporalCase(
        'equal PlainDateTimes are equal',
        () => Temporal.PlainDateTime.from('2026-11-13T07:00'),
        () => Temporal.PlainDateTime.from('2026-11-13T07:00'),
        true
      ),
      temporalCase(
        'equal PlainYearMonths are equal',
        () => Temporal.PlainYearMonth.from('2026-11'),
        () => Temporal.PlainYearMonth.from('2026-11'),
        true
      ),
      temporalCase(
        'equal PlainMonthDays are equal',
        () => Temporal.PlainMonthDay.from('11-13'),
        () => Temporal.PlainMonthDay.from('11-13'),
        true
      ),
      // The ISO reference day/year isn't in the default `toString()`, but
      // `equals()` compares it.
      temporalCase(
        'PlainYearMonths with different reference days are not equal',
        () => new Temporal.PlainYearMonth(2026, 11, 'iso8601', 1),
        () => new Temporal.PlainYearMonth(2026, 11, 'iso8601', 2),
        false
      ),
      temporalCase(
        'PlainMonthDays with different reference years are not equal',
        () => new Temporal.PlainMonthDay(11, 13, 'iso8601', 1972),
        () => new Temporal.PlainMonthDay(11, 13, 'iso8601', 2000),
        false
      ),
      temporalCase(
        'equal Instants are equal',
        () => Temporal.Instant.fromEpochNanoseconds(1n),
        () => Temporal.Instant.fromEpochNanoseconds(1n),
        true
      ),
      temporalCase(
        'Instants 1 ns apart are not equal',
        () => Temporal.Instant.fromEpochNanoseconds(1n),
        () => Temporal.Instant.fromEpochNanoseconds(2n),
        false
      ),
      temporalCase(
        'equal ZonedDateTimes are equal',
        () => Temporal.ZonedDateTime.from('2026-11-13T07:00[Europe/Dublin]'),
        () => Temporal.ZonedDateTime.from('2026-11-13T07:00[Europe/Dublin]'),
        true
      ),
      temporalCase(
        'ZonedDateTimes at the same instant in different zones are not equal',
        () => Temporal.ZonedDateTime.from('2026-11-13T07:00[UTC]'),
        () => Temporal.ZonedDateTime.from('2026-11-13T07:00[Europe/London]'),
        false
      ),
      temporalCase(
        'ZonedDateTimes in time zone aliases are equal',
        () => Temporal.ZonedDateTime.from('2026-11-13T07:00[Asia/Kolkata]'),
        () => Temporal.ZonedDateTime.from('2026-11-13T07:00[Asia/Calcutta]'),
        true
      ),
      temporalCase(
        'equal Durations are equal',
        () => Temporal.Duration.from('PT1H30M'),
        () => Temporal.Duration.from('PT1H30M'),
        true
      ),
      temporalCase(
        'different Durations are not equal',
        () => Temporal.Duration.from('PT1H30M'),
        () => Temporal.Duration.from('PT90M'),
        false
      ),
      temporalCase(
        'a PlainDate and a PlainDateTime are not equal',
        () => Temporal.PlainDate.from('2026-11-13'),
        () => Temporal.PlainDateTime.from('2026-11-13'),
        false
      ),
      temporalCase(
        'a Temporal value and its string are not equal',
        () => Temporal.PlainTime.from('07:00'),
        () => '07:00:00',
        false
      ),
      temporalCase(
        'objects with equal Temporal values are equal',
        () => ({ time: Temporal.PlainTime.from('07:00') }),
        () => ({ time: Temporal.PlainTime.from('07:00') }),
        true
      ),
      temporalCase(
        'objects with different Temporal values are not equal',
        () => ({ time: Temporal.PlainTime.from('07:00') }),
        () => ({ time: Temporal.PlainTime.from('08:00') }),
        false
      ),
      temporalCase(
        'arrays of equal Temporal values are equal',
        () => [Temporal.PlainDate.from('2026-11-13')],
        () => [Temporal.PlainDate.from('2026-11-13')],
        true
      ),
    ],
  },
];

export { generic, es6, react, custom, dataViews, temporal };
export const all = [].concat(generic, es6, react, custom, dataViews, temporal);

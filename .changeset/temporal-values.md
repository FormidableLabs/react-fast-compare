---
"react-fast-compare": patch
---

Fix `isEqual` throwing when comparing two different `Temporal` values (e.g. `Temporal.PlainTime`), including ones nested in objects or arrays. They're now compared with their `equals()` method (`Temporal.Duration`, which has none, by `toString()`).

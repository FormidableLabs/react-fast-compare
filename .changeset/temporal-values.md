---
"react-fast-compare": patch
---

Fix `isEqual` throwing when comparing two different `Temporal` values (e.g. `Temporal.PlainTime`), including ones nested in objects or arrays. They're now compared by their `toString()` (ISO string with calendar and time zone).

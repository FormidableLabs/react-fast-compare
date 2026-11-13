---
"react-fast-compare": patch
---

Fix `isEqual` hanging forever when comparing two `DataView`s. They're now compared byte by byte.

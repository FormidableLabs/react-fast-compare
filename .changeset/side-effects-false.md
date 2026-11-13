---
"react-fast-compare": patch
---

Add `"sideEffects": false` to `package.json` so bundlers can drop the module when it's imported but unused.

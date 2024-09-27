---
"app-avatax": patch
---

Refactored so called "webhook service" class. Now each webhook creates it's own dependencies. It's a part of larger refactor that aims to simplify app's architecture. No functional change is expected.

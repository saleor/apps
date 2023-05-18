---
"saleor-app-taxes": minor
---

Adds `resolveOptionalOrThrow` util that throws when not able to resolve an optional value. Now, when critical values from external APIs are not found, the app will crash instead of falling back to 0s.

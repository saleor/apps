---
"app-avatax": patch
---

Don't send handled error for `checkoutCalculateTaxes` event into Sentry. It will be logged instead.

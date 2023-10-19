---
"saleor-app-taxes": patch
---

Removed the hardcoded error message for when `order-cancelled` webhook handler fails. Split up errors to be expected/critical. Expected are not reported to Sentry.

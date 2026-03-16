---
"saleor-app-avatax": patch
---

Internal "timeout" error from AvaTax client is now handled. Returns 504 to Saleor and does not send this error to Sentry

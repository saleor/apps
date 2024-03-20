---
"app-avatax": patch
---

Cleanup `WebhookResponse.error` function - now it won't capture exception to Sentry. Instead you should use `Sentry.captureException` explicitly when there is unhandled exception.

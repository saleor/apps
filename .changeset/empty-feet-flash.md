---
"app-avatax": patch
---

Improved error handling and reporting while migrating webhooks. After this change we skip logging to OTEL. Logs will be available on Vercel, when migration fail we will send error to Sentry.

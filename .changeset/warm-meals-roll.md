---
"segment": patch
---

Added logger context and OTEL wrappers to tRPC API routes with Sentry support. After this change 5xx errors will be send to Sentry and we will see tRPC related endpoints in OTEL.

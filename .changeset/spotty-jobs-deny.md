---
"saleor-app-avatax": patch
---

Fix how we initialize Sentry SDK for API routes when using node.js runtime. After this change we will use `NodeClient` from Sentry directly - avoiding Sentry interference with our OTEL setup.

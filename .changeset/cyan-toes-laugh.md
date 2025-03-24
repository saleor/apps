---
"saleor-app-products-feed": patch
"saleor-app-klaviyo": patch
"saleor-app-segment": patch
"saleor-app-avatax": patch
"saleor-app-search": patch
"saleor-app-smtp": patch
"saleor-app-cms": patch
---

Fixed how we initialize Sentry SDK for API routes when runtime is Node.js. After this change we will use `NodeClient` directly from Sentry SDK to avoid interfering with our OTEL setup. We also removed not needed Sentry integration for edge runtime

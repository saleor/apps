---
"@saleor/apps-otel": patch
---

Patch OTEL dependency - it should handle NaN & Infinity values. It will ensure that logs are properly parsed and send to log service.

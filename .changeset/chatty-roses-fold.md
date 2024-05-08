---
"@saleor/apps-logger": patch
---

Send empty keys to OTEL. Thanks to that change our queries that consume OTEL will have access to falsy values.

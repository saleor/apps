---
"@saleor/apps-logger": patch
---

Changed how we serialize errors in logs for OTEL. After this change they will be JSON stringified instead on modern error serialize function which didn't work with nested objects.

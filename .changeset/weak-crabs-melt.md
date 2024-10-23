---
"@saleor/apps-logger": patch
---

Added missing OTEL attributes to `loggerVercelTransport`. They will be visible under `otel` key in log collection service.

Attributes:
* `span_id`
* `trace_id`
* `timestamp`

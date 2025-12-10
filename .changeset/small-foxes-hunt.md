---
"@saleor/apps-otel": minor
---

Add `createTraceEffect` utility for tracing async operations with configurable slow thresholds. This factory-based utility logs operation start/finish and warns when operations exceed defined thresholds. Useful for monitoring external calls (APIs, databases) to investigate performance issues.

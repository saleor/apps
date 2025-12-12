---
"@saleor/apps-otel": minor
---

Add `createTraceEffect` utility for tracing async operations with OTEL spans, adding logs, and configurable slow thresholds.

**@saleor/apps-otel:**
- `createTraceEffect` wraps operations with OTEL spans
- Sets span attributes for duration, slow threshold, and custom attributes
- Sets ERROR status when operations exceed slow threshold or fail
- Records exceptions on failures
- Supports optional logging callbacks (`onStart`, `onFinish`, `onSlow`, `onError`)

Each app has to create it's own `createTraceEffect` with it's logger assigned to the callback methods, in order to have logs for slow operations.

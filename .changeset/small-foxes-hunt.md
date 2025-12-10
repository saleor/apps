---
"@saleor/apps-otel": minor
"@saleor/apps-logger": minor
---

Add `createTraceEffect` utility for tracing async operations with OTEL spans and configurable slow thresholds.

**@saleor/apps-otel:**
- `createTraceEffect` wraps operations with OTEL spans
- Sets span attributes for duration, slow threshold, and custom attributes
- Sets ERROR status when operations exceed slow threshold or fail
- Records exceptions on failures
- Supports optional logging callbacks (`onStart`, `onFinish`, `onSlow`, `onError`)

**@saleor/apps-logger:**
- Re-exports `createTraceEffect` with default logging callbacks enabled
- Use `@saleor/apps-logger/trace-effect` for tracing with automatic logging

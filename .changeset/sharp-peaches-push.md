---
"@saleor/apps-shared": minor
---

Add `compose` function that can be used to compose multiple functions into one:

```ts
// before
export default wrapWithLoggerContext(withSpanAttributes(handler));
// after
export default compose(withLoggerContext, withSpanAttributes)(handler)
```

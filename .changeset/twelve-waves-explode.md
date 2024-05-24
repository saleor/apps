---
"@saleor/apps-otel": minor
---

Wrapped OTEL flushing logic with [waitUntil](https://vercel.com/docs/functions/functions-api-reference#waituntil).
Now response from a webhook should be immediate, but flushing will not be terminated by Vercel.

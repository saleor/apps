---
"app-avatax": patch
---

Added dynamic loading of business services in webhooks. Now, when webhook is executed for incomplete payload (like missing address or lines), handler will return early. If payload is complete, further services will be loaded dynamically. This change speed up Vercel cold start by ~7s.

---
"@saleor/apps-logger": patch
---

Fix Vercel runtime transport logs attribute order - attributes from logs context will be first so log attributes can override them.

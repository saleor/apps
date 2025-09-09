---
"saleor-app-avatax": patch
---

Changed tRPC logs to add `[TRPC Error]` prefix, to distinguish these errors from others. Changed tRPC error codes to better reflect HTTP status codes (e.g. unauthorized, instead of internal server error).

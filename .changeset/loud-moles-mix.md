---
"@saleor/webhook-utils": minor
---

Added app-deleted-handler, shared webhook abstraction, that automatically runs apl.delete(). It additionally exposes hooks to run extra clean up, like DynamoDB pruning (this is per-app logic).

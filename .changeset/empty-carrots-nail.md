---
"saleor-app-search": patch
---

Fixed Search app crashes, due to accessing env variable previously marked as server side only on frontend (`ALGOLIA_TIMEOUT_MS`)

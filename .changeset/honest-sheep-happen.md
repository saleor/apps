---
"app-avatax": patch
---

Implement client logs cache. Right now app will cache request for 1 day and revalidate the cache every 60 seconds.
Added forward / backward pagination to client logs. After this change end user can browse logs that exceeds current pagination limit (first 100).

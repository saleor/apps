---
"@saleor/apps-shared": patch
---

Added `race` function. This utility helps prevent promises from hanging indefinitely by adding a timeout constraint. If the original promise doesn't resolve within the specified timeout, the race will reject with the provided error.

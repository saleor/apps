---
"saleor-app-search": minor
---

When application config is removed on Algolia side, app was still running and reporting issues. Now if Algolia reports that ID no longer exists, Search App will report a Problem and disable itself

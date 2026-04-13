---
"saleor-app-search": minor
---

When application config is removed on Algolia side, app was still running and reporting issues. Now if Algolia reports that ID no longer exists, Search App will report a Problem and disable itself.

Additionally, when app Admin API key is not working, app will disable itself.

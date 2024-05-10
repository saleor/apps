---
"search": patch
---

Fixed problem when webhooks were disabled if _any_ error from Algolia was received. Now only 401 and 403 errors (invalid auth/credentials) will cause webhooks disabling, until app is configured again.

---
"saleor-app-avatax": patch
---

Added InvalidZipForStateError to expected errors. It will no longer be treated as exception in logs and Sentry. This error is thrown when user enters incorrect Zip code for their state.

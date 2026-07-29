---
"saleor-app-search": patch
---

Search app no longer raises an error alert when Algolia rejects an indexing request. Errors returned by the Algolia API — for example exceeding the index limit of the Algolia plan — are caused by the merchant's Algolia account, not by a bug in the app, so they are now logged as warnings. Additionally, the Algolia status code is now passed back to Saleor: permanent failures (4xx) are no longer retried, while temporary Algolia outages (5xx) still are.

---
"saleor-app-search": patch
---

Improved error handling for Algolia record size limit errors.
When a product variant exceeds Algolia's 10KB limit, the webhook now returns a HTTP 413 error with clear error message (can be seen in Saleor Dashboard).
These expected errors are now logged as warnings instead of errors.

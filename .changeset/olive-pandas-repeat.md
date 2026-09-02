---
"saleor-app-search": patch
---

Fixed `inStock` still being indexed as `false` in Algolia after stock was restored in Saleor.

Before: the previous fix fetched stock availability per channel, but only when `inStock` was listed among the app's enabled fields. `inStock` is always indexed and cannot be turned off in the app UI, so it never appeared on that list - the extra fetch was skipped on every webhook and the app fell back to the channel-less value from the webhook payload, which Saleor always resolves to 0. Setting stock to 0 looked correct, but restoring it left the product marked as out of stock until the next full index.

After: stock availability is always fetched per channel when a webhook arrives, so restoring stock in Saleor marks the product as in stock in Algolia straight away.

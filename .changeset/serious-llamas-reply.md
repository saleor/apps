---
"saleor-app-products-feed": patch
---

Changed app to query product variants in chunks of 50 instead of 100. This should not change how it behaves, but will distribute resources better.

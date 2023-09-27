---
"saleor-app-products-feed": patch
---

Changed Vercel's maximum execution time to be 5 minutes for feed generation. This should help with the previous limits of 60s, that was not enough for feed to be generated.

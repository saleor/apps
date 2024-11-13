---
"app-avatax": minor
---

Added AvaTax `itemCode` support when handling order or checkout calculate taxes webhooks. After this change app will send `itemCode` to Avalara based on Saleor variant SKU or variant id.

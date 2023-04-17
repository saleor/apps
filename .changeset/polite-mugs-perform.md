---
"saleor-app-taxes": minor
---

Completed the order flow with new webhooks: `order_created` and `order_fulfilled`. In TaxJar, an order will be created on `order_created` with no actions on `order_fulfilled`. In Avatax, a transaction will be created on `order_created` and commited on `order_fulfilled`.

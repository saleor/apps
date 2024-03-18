---
"app-avatax": minor
---

Avatax app will now send `productVariantId` from `OrderLine` to Avatax if there is no `productSku` while processing `ORDER_CREATED` webhook.

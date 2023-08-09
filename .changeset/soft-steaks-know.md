---
"saleor-app-taxes": minor
---

Changed the order_created to order_confirmed webhook event. Now, the provider transactions will be created based on the order confirmation (either automatic or manual). Also, removed the order_fulfilled webhook event handler. The value of the "commit" field is now set only based on the "isAutocommit" setting in the provider configuration.

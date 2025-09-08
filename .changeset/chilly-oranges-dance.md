---
"saleor-app-avatax": minor
---

Send Saleor order number instead of order id as AvaTax document code. Previously app was using first 20 characters of order id. This was causing a problem on AvaTax side as there weren't any way of connecting Saleor order (as order id was truncated to first 20 chars). After this change app will send order number (e.g 2137) instead. Thanks to that you will see it in AvaTax dashboard and you will be able to use this number for searching for order in Saleor.

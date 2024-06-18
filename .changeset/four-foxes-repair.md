---
"app-avatax": minor
---

Fixed discount logic. After this change AvaTax app will send Saleor discounts to Avalara for automatic distribution when handling calculate taxes webhook for order and checkout. Discount logic when confirming order will remain unchanged - AvaTax app will use price reduction discounts and sends totalPrice from Saleor.

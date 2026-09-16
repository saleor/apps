---
"saleor-app-smtp": patch
---

Fixed webhooks not being registered on Saleor 3.22. Before, the app sent a subscription query containing `GiftCardPaymentMethodDetails` - a type that only exists in Saleor 3.23 - so Saleor rejected 7 of 9 webhooks during installation and the app silently sent no order or invoice emails. Now the app detects the Saleor version and registers a query that instance accepts, keeping gift card payment method details on 3.23 and dropping just that field on 3.22.

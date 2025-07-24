---
"saleor-app-payment-stripe": minor
---

Events from Stripe that doesn't contain metadata are now gracefully ignored. App will not try to proceed such event, which eventually ended with TransactionNotFound error. Instead it's early returned, not DB is called and proper status is returned to Stripe.

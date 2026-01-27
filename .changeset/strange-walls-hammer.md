---
"saleor-app-payment-stripe": minor
---

Now app will cancel Payment Intent (on Stripe side) when it fails to finish saving transaction on app's side (record in DynamoDB). That behavior was data partially broken and webhooks couldn't be resolved. Now if DynamoDB write fails, app cleans the orphaned intent. This happens on TransactionInitializeSession

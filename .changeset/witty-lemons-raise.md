---
"saleor-app-payment-stripe": patch
---

Fixed race condition in transaction recording that caused `ConditionalCheckFailedException` errors.
Previously, when two concurrent requests with the same idempotency key arrived (e.g., user clicking pay button multiple times),
the second request would fail with a DynamoDB error.
Now, duplicate write attempts are treated as idempotent success since Stripe already ensures the payment intent is not charged multiple times.

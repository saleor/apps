---
"saleor-app-payment-stripe": patch
---

Fix missing metadata in Stripe PaymentIntent creation

Fixes a critical bug where metadata (including `saleor_transaction_id`, `saleor_source_id`, and `saleor_source_type`) was not being passed to Stripe when creating PaymentIntents. This caused webhook processing to fail with "Object created outside of Saleor is not processable" error after the July 24 security update that enforces metadata validation.

The metadata was being prepared correctly in the transaction-initialize-session webhook handler but was not included in the actual Stripe API call.
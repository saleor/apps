---
"saleor-app-payment-stripe": minor
---

Add support for [ACH Direct Debit](https://docs.stripe.com/payments/ach-direct-debit) and [SEPA Direct Debit](https://docs.stripe.com/payments/sepa-debit) payment methods.
Also fixed issue where app was using incorrect amount when handling processing event from Stripe (previously it was using `amount_received` and after this change it is using `amount` from Stripe event).

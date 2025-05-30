---
"saleor-app-payment-stripe": patch
---

Updated how app handles transaction not found in internal DB - after this change app will responds with 400 status code meaning that Stripe won't retry webhook request.

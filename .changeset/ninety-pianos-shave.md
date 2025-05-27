---
"saleor-app-payment-stripe": patch
---

App doesn't throw anymore when ID from Stripe doesn't match expected format. Previously app was checking format like "pk_live_" or "whsec_". Now it will inform Sentry that it faced unexpected value, but continue to work.

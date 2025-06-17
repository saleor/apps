---
"saleor-app-payment-stripe": patch
---

Added generated types from Saleor JSON schemas for webhooks. Fixed missing actions for TransactionInitializeSession. After this change staff user can cancel transaction even if there is no payment made but payment intent has been created.

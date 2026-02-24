---
"saleor-app-payment-stripe": patch
---

Fixed issue when app was missing mapping for channel used in payment. Instead of throwing exception, app will now return responses to Saleor webhook with error message.

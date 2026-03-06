---
"saleor-app-products-feed": minor
"saleor-app-payment-np-atobarai": minor
"saleor-app-klaviyo": minor
"saleor-app-segment": minor
"saleor-app-search": minor
"saleor-app-payment-stripe": minor
"saleor-app-smtp": minor
"saleor-app-cms": minor
---

Webhook responses now return plain text response to Saleor, so it should be properly displayed in dashboard "webhook errors". Previously app was returning `{"message": "..."}` which is not recognized shape officially by Saleor nor Dashboard - it was rendered like text anyway.

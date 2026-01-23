---
"saleor-app-products-feed": patch
"saleor-app-payment-np-atobarai": patch
"saleor-app-klaviyo": patch
"saleor-app-segment": patch
"saleor-app-avatax": patch
"saleor-app-search": patch
"saleor-app-payment-stripe": patch
"saleor-app-smtp": patch
"saleor-app-cms": patch
---

Added max DynamoDB connection and request limits (2s for connection, 5s for request), so in case of downtime, app will terminate earlier

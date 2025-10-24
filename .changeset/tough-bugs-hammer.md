---
"saleor-app-avatax": patch
"saleor-app-payment-stripe": patch
"saleor-app-smtp": patch
"saleor-app-segment": patch
"saleor-app-search": patch
"saleor-app-products-feed": patch
"saleor-app-np-atobarai": patch
"saleor-app-klaviyo": patch
"saleor-app-cms": patch
---

When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

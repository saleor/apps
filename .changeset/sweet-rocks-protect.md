---
"saleor-app-products-feed": patch
"saleor-app-payment-np-atobarai": patch
"saleor-app-klaviyo": patch
"saleor-app-segment": patch
"saleor-app-search": patch
"saleor-app-payment-stripe": patch
"saleor-app-smtp": patch
"saleor-app-cms": patch
---

Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

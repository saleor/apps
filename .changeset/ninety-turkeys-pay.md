---
"@saleor/webhook-utils": patch
"saleor-app-klaviyo": patch
"saleor-app-segment": patch
"saleor-app-avatax": patch
"saleor-app-search": patch
"saleor-app-payment-stripe": patch
"saleor-app-smtp": patch
"saleor-app-cms": patch
"saleor-app-products-feed": patch
"saleor-app-payment-np-atobarai": patch
---

Changed how generated graphql->typescript types work. Now only types that are directly or indirectly connected to written documents (mutations, queries) are generated

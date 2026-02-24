---
"@saleor/webhook-utils": patch
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

Removed nested graphql.schema files for each app/package and added root schema. Now all packages have symlink pointing to the same file.

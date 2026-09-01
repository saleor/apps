---
"@saleor/apps-shared": minor
"saleor-app-avatax": patch
"saleor-app-cms": patch
"saleor-app-klaviyo": patch
"saleor-app-payment-dummy": patch
"saleor-app-shipping-dummy": patch
"saleor-app-payment-np-atobarai": patch
"saleor-app-products-feed": patch
"saleor-app-search": patch
"saleor-app-segment": patch
"saleor-app-smtp": patch
"saleor-app-payment-stripe": patch
---

Apps now identify themselves when they call the Saleor GraphQL API. Before, requests
went out with the runtime's default `User-Agent`, so it was impossible to tell from
Saleor's access logs which app produced them. Now every server-side request carries
`User-Agent: <app-package-name>/<app-version>`, e.g. `saleor-app-avatax/3.1.0`.

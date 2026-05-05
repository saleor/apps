---
"saleor-app-avatax": patch
"saleor-app-cms": patch
"saleor-app-payment-np-atobarai": patch
"saleor-app-products-feed": patch
"saleor-app-search": patch
"saleor-app-segment": patch
"saleor-app-smtp": patch
"saleor-app-payment-stripe": patch
---

Failed JWT verification in tRPC procedures no longer reports to Sentry as an error. Before, an expired or invalid token raised a 500 (or 403) and produced an error in monitoring even though it was a normal client-side auth failure. Now it logs a warning and returns 401, so dashboards stay clean and the client can react to the auth state correctly.

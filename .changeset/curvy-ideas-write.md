---
"saleor-app-products-feed": patch
"saleor-app-payment-np-atobarai": patch
"@saleor/apps-shared": patch
"saleor-app-klaviyo": patch
"saleor-app-segment": patch
"saleor-app-avatax": patch
"saleor-app-search": patch
"saleor-app-payment-stripe": patch
"saleor-app-smtp": patch
"saleor-app-cms": patch
---

Added support for changing `SECRET_KEY` in production environment. App will now support providing a fallback keys via env variables. It will use them if decrypting settings fails, and save using new secret key. Each app now also has a script to rotate secret keys in all installed apps.

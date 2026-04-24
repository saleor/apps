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

Added support for changing `SECRET_KEY` in production environment.

In order to use new secret key add `NEW_SECRET_KEY` env variable.
App will use `NEW_SECRET_KEY` for saving new configurations, and will use existing `SECRET_KEY` as a fallback for decryption.

To update all configurations in all app instances, use rotation script in each app: `pnpm rotate-secret-key`.

For more details read `packages/shared/src/key-rotation/README.md` documentation

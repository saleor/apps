---
"@saleor/apps-shared": patch
"saleor-app-avatax": patch
"saleor-app-cms": patch
"saleor-app-klaviyo": patch
"saleor-app-payment-np-atobarai": patch
"saleor-app-products-feed": patch
"saleor-app-search": patch
"saleor-app-segment": patch
"saleor-app-smtp": patch
"saleor-app-payment-stripe": patch
---

Secret-key rotation now uses a single new env var, `NEW_SECRET_KEY`, instead of requiring the current `SECRET_KEY` value to be copied into a `FALLBACK_SECRET_KEY_*` slot.
This makes rotation possible when the current `SECRET_KEY` is stored on a platform that does not allow reading it back (for example, Vercel's Sensitive env vars).

New flow: generate a new key, set it as `NEW_SECRET_KEY`, deploy. The app starts encrypting new writes with `NEW_SECRET_KEY` while old data is still decrypted with `SECRET_KEY`. The rotation script (`scripts/rotate-secret-key.ts`) re-encrypts stored data from `SECRET_KEY` to `NEW_SECRET_KEY`. After rotation, replace `SECRET_KEY` with the new value (admin still has it locally, so any env-var type works) and remove `NEW_SECRET_KEY`.

**Breaking**: the legacy `FALLBACK_SECRET_KEY_1/2/3` env vars are no longer read.

---
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

When environment variables fail validation at startup, the app now prints a readable error message and the offending fields, then exits with code 1 — instead of dumping a long stack trace. Before: a wall of webpack stack frames around `Invalid environment variables`. After: e.g. `Validation error: Required at "SECRET_KEY"` followed by a JSON list of the failing fields.

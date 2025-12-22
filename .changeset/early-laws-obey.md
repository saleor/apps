---
"saleor-app-payment-np-atobarai": patch
---

Improved error handling for payload validation errors.
Previously, validation errors during transaction payload preparation could throw unhandled exceptions. Now these errors are properly caught and returned as structured error responses with the new `PayloadValidationError` code.

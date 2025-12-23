---
"saleor-app-payment-np-atobarai": patch
---

Fixed HTTP 500 errors when customer data (email, phone, billing address) is missing.
These validation errors now return HTTP 202 instead, preventing Saleor webhook circuit breaker from disabling payment webhooks.

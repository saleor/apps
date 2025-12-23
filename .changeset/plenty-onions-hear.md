---
"saleor-app-payment-np-atobarai": patch
---

Fixed Zod validation errors raising exceptions. Validation errors in customer data, delivery destination, and money fields now return warnings instead of throwing exceptions, preventing HTTP 500 responses to Saleor webhooks.

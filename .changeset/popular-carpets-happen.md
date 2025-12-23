---
"saleor-app-payment-np-atobarai": patch
---

Zod validation errors will no longer cause app to throw unexpected exception, and instead will be properly handled.
Previously they were not caught and caused app to send `logger.error`

---
"saleor-app-payment-np-atobarai": patch
---

App will now return `apiError` field that (if available) comes from Atobarai API. It will be returned in TransactionInitializeSession and TransactionProcessSession webhook responses, together with existing errors. Error codes are internal to Atobarai API and can be verified in relevant API docs

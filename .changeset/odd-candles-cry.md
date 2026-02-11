---
"saleor-app-payment-stripe": patch
---

Return better error message to initializeSession ChARGE_FAILURE - previously error was only returned to storefront (inside "data"), not also visible in the dashboard

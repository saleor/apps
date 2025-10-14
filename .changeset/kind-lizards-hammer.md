---
"saleor-app-payment-stripe": patch
---

Removed unnecessary error logs that printed all non-ok responses from tRPC in the main Procedure. That is not necessary because main tRPC config already prints errors from 500 status errors. Now only one error will be logged if necessary

---
"saleor-app-payment-stripe": patch
---

Move building command to DynamoDB into try / catch. After this change when building command fails user will see better error message instead of generic one.

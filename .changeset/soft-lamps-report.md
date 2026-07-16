---
"saleor-app-smtp": patch
---

Fixed SMTP order template saving so templates are validated with the matching event example payload instead of an empty payload. Templates that preview correctly for `ORDER_CREATED` can now be saved correctly.

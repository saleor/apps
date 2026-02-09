---
"saleor-app-smtp": patch
---

Changed behavior of "sender email" calculation for fallback SMTP config behavior. Now it will be computed from Saleor Cloud's tenant name and domain provided in env variable

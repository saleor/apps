---
"saleor-app-smtp": patch
---

Changed behavior of "sender email" calculation for fallback SMTP config behavior. Now it will be computed from Saleor Cloud's tenant name and the domain provided in an environment variable

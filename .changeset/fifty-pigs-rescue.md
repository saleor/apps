---
"saleor-app-smtp": patch
---

Email templates will now be validated before saving them. Invalid templates cannot be saved to prevent errors when handling Saleor webhooks. Errors are now also shown when editing template with clear explanation on how to resolve them.

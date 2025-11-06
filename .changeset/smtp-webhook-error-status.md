---
"saleor-app-smtp": patch
---

Webhook errors from email provider no longer trigger automatic retries. When SMTP server errors occur, the webhook now returns a 400 status code instead of 500, preventing Saleor from repeatedly attempting to send emails that will fail due to configuration or provider issues.

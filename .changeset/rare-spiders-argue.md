---
"saleor-app-emails-and-messages": patch
---

Added validation for Sendgrid events form. Enabling event without a template is no longer allowed to avoid misconfiguration and undelivered emails.

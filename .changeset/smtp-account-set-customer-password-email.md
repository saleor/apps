---
"saleor-app-smtp": patch
---

You can now configure an email template for the "Customer account password setup" event. Previously, when you created a customer via the `customerCreate` mutation with a `redirectUrl`, Saleor emitted a notification but the SMTP app silently ignored it — no password-setup email was sent. The event is now wired through the existing NOTIFY pipeline alongside the existing password-reset event, with its own default template ("Set your password") and the `{{password_set_url}}` variable bound to Saleor's set-password URL.

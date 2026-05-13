---
"saleor-app-smtp": minor
---

Added support for `CUSTOMER_DELETED` event. When a customer account is deleted in Saleor (3.23+), the app can now send a templated confirmation email to the user's last known email address. The event exposes `{{user.id}}`, `{{user.email}}`, `{{user.firstName}}`, `{{user.lastName}}` to templates. Because `CUSTOMER_DELETED` does not carry a channel in its payload, the event is dispatched against every active SMTP configuration that has the event enabled. The event row is disabled in the dashboard for Saleor instances older than 3.23 and the webhook will refuse to register on unsupported versions.

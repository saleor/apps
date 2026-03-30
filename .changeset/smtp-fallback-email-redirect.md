---
"saleor-app-smtp": minor
---

Added support for redirecting fallback emails to a different address. When `FALLBACK_EMAIL_REDIRECT_ENDPOINT` and `FALLBACK_EMAIL_REDIRECT_TOKEN` env vars are configured, emails sent via the fallback SMTP path are redirected to the address returned by the endpoint instead of the original recipient. The original recipient email is prepended to the subject line (e.g. `[original@example.com] Your order is confirmed!`). A preview banner is also injected at the top of the email body stating that the email was delivered to the organization owner's address and not to the customer.

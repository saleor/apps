---
"saleor-app-emails-and-messages": minor
---

Webhooks are no longer created during the app registration. Instead, the app will subscribe events based on it's configuration, after change has been detected.

This change does not have negative impact on existing app installations - webhooks will be removed during next change of the provider configuration.

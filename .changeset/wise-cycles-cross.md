---
"search": minor
---

Removed the functionality that automatically disabled webhooks when Algolia responded with errors.
This behavior was unstable, and we received reports that webhooks were being randomly disabled, even when the credentials were correct.

To ensure apps operate reliably, webhooks are now managed as follows:

- After installation, if the app is not configured, webhooks are disabled.
- When the configuration is saved, the app validates Algolia credentials. Invalid credentials cannot be saved.
- Once valid credentials are saved, webhooks are enabled.
- Webhooks will remain enabled, even if tokens are rotated.
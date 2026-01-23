---
"saleor-app-smtp": minor
---

Added default/fallback configuration for an app.

Previously, app required full configuration to start working.

Now, app enables out-of-the-box setting. When configured (env variables), app will be able to send default messages, which should help new users to bootstrap quickly.

Existing installations will not change, unless enabled in app settings. For new installations:
1. "fallback"  behavior will be enabled
2. webhooks will be created/enabled
3. app will send events (which can be disabled or overwritten by custom configuration)

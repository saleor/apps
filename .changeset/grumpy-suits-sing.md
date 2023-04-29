---
"saleor-app-search": minor
---

Added webhooks optimization feature. App will validate Algolia config in several places:
1. During config form submit
2. During loading frontend
3. During webhooks invocation

If Algolia "ping" fails with 403, app will disable webhooks, assuming its misconfigured.

Webhooks status is displayed in App configuration screen. If they are disabled, user can preview failed webhooks deliveries


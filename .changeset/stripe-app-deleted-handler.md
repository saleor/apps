---
"saleor-app-stripe": minor
---

Implemented APP_DELETED handler. On Saleor 3.23+, when the app is uninstalled, it now removes its DynamoDB data (Stripe configurations, channel-to-config mappings, recorded transactions) and best-effort deletes the webhooks it had registered on the Stripe side, in addition to pruning APL data.

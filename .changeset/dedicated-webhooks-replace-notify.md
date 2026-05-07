---
"saleor-app-smtp": minor
---

Added 9 dedicated webhooks to replace the catch-all `notify` webhook with typed GraphQL subscriptions, so templates can use fields from GraphQL schema.

New events:

- `ACCOUNT_CONFIRMATION_REQUESTED` — replaces deprecated `ACCOUNT_CONFIRMATION`
- `ACCOUNT_DELETE_REQUESTED` — replaces deprecated `ACCOUNT_DELETE`
- `ACCOUNT_SET_PASSWORD_REQUESTED` — replaces deprecated `ACCOUNT_PASSWORD_RESET`
- `ACCOUNT_CHANGE_EMAIL_REQUESTED` — replaces deprecated `ACCOUNT_CHANGE_EMAIL_REQUEST`; email goes to the user's CURRENT address asking them to authorize switching to `{{newEmail}}`
- `ACCOUNT_EMAIL_CHANGED` — replaces deprecated `ACCOUNT_CHANGE_EMAIL_CONFIRM`; confirmation email is now delivered to the new address (`{{newEmail}}`) so the user has explicit confirmation on the right inbox
- `FULFILLMENT_TRACKING_NUMBER_UPDATED` — replaces deprecated `ORDER_FULFILLMENT_UPDATE`; uses typed payload (`{{fulfillment.trackingNumber}}`, `{{order.number}}`, `{{order.userEmail}}`)
- `FULFILLMENT_CREATED` — brand-new event, no legacy equivalent
- `FULFILLMENT_APPROVED` — brand-new event, no legacy equivalent
- `FULFILLMENT_CANCELED` — brand-new event, no legacy equivalent

Legacy events are flagged deprecated in the dashboard with a hint pointing to the replacement event; existing templates keep working unchanged. New tenants no longer see deprecated events in their default configuration. Existing tenants automatically get the new event rows populated with default templates and `active: false` until they enable them.

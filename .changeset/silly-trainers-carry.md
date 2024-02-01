---
"taxes": minor
---

The app can now read the value of AvaTax's transaction `customerCode` from the `user.avataxCustomerCode` metadata field. If not provided, the app will use `user.id` for a logged-in user or the recommended fallback value.

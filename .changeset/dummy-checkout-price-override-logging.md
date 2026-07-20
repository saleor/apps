---
"saleor-app-payment-dummy": minor
---

When a checkout line uses a price override, the Quick checkout page now runs `checkoutCreate` on the app's backend instead of directly from the browser. This lets the Saleor operation be logged server-side — gated behind the new `LOG_SALEOR_OPERATIONS` env flag, so nothing is logged in production — and forwards any Saleor error (for example a missing `HANDLE_CHECKOUTS` permission) back to the UI, where it is now shown instead of failing silently. Checkouts without a price override keep using the existing client-side flow.

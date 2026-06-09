---
"saleor-app-avatax": patch
---

The order details widget now auto-sizes to fit its content in the Saleor Dashboard sidebar, instead of staying at a fixed height. Requires Saleor Dashboard 3.23.7+ and `@saleor/app-sdk` 1.9.0+ (currently pinned to 1.9.0-rc.1 until stable release). Existing installations need to update the app manifest (reinstall or update the app) for the widget URL change to take effect.

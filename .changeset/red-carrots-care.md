---
"app-avatax": patch
---

Fixed issue when `totalPrice` was set to 0 when checkout did not have address. After this change app will return `totalPrice` as fallback for `gross` and `net` so storefront user won't be confused with prices being 0.

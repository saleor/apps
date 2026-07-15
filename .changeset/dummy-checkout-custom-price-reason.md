---
"saleor-app-payment-dummy": minor
---

The Quick checkout testing page now lets you build the checkout from multiple lines instead of a single hardcoded product. For each line you can pick a product and quantity, and enable a "Custom price" option that reveals price and reason inputs. Both values are sent to Saleor as the line's `price` and `priceOverrideReason`, and the created checkout echoes them back so you can verify the override. Setting a custom price requires the app's new `HANDLE_CHECKOUTS` permission (re-install the app to grant it). While any request is in flight (loading products, creating the checkout, setting delivery, etc.) the page's controls are disabled and a busy cursor is shown, so overlapping operations can't be triggered.

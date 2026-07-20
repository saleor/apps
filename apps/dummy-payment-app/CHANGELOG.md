# saleor-app-payment-dummy

## 1.1.0

### Minor Changes

- 0cfd65b: The Quick checkout testing page now lets you build the checkout from multiple lines instead of a single hardcoded product. For each line you can pick a product and quantity, and enable a "Custom price" option that reveals price and reason inputs. Both values are sent to Saleor as the line's `price` and `priceOverrideReason`, and the created checkout echoes them back so you can verify the override. Setting a custom price requires the app's new `HANDLE_CHECKOUTS` permission (re-install the app to grant it). While any request is in flight (loading products, creating the checkout, setting delivery, etc.) the page's controls are disabled and a busy cursor is shown, so overlapping operations can't be triggered.
- 0cfd65b: When a checkout line uses a price override, the Quick checkout page now runs `checkoutCreate` on the app's backend instead of directly from the browser. This lets the Saleor operation be logged server-side — gated behind the new `LOG_SALEOR_OPERATIONS` env flag, so nothing is logged in production — and forwards any Saleor error (for example a missing `HANDLE_CHECKOUTS` permission) back to the UI, where it is now shown instead of failing silently. Checkouts without a price override keep using the existing client-side flow.

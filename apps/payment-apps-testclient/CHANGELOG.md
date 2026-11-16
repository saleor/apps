# saleor-payment-apps-testclient

## 0.3.0

### Minor Changes

- a728141: You can now choose products and quantities for a test checkout, search and load more products, or open an existing checkout. The cart starts with two products when available and also supports channels with only one suitable product.

### Patch Changes

- a728141: Completed checkouts now retain the created order confirmation, so you can open the order in Dashboard or start another checkout after the success notification would have disappeared.

## 0.2.1

### Patch Changes

- d34f4d9: Upgraded Next.js to v16.4.5
- 7fb571e: You can now pay with Adyen cards that require 3D Secure. Before, the payment stopped at the loading state after the card details were submitted, and the 3D Secure challenge never appeared.

## 0.2.0

### Minor Changes

- f5e59c2: Square Online and Square Terminal are now available in the shared payment test client alongside Adyen and Stripe.

### Patch Changes

- 4babe9c: The checkout page now has an "Act as logged-in customer" option. Enter an existing Saleor customer's email and password, and the checkout is attached to that customer, so payment apps receive a signed-in buyer instead of a guest. Before, the test client could only check out as a guest (except Square's saved-card login). The customer must already exist in Saleor.

## 0.1.5

### Patch Changes

- 742b2b7: The app is now built with Turbopack instead of webpack, so builds and local development are faster. App behavior is unchanged.

## 0.1.4

### Patch Changes

- 7783337: Upgraded next.js v16.4.1

## 0.1.3

### Patch Changes

- 14691bc: Upgraded neverthrow from v6.2.1 to v8.1.1 and zod from v3.21.4 to v3.24.1. App behavior doesn't change.

## 0.1.2

### Patch Changes

- a2fbe4a: Upgraded Next.js from v15.5.27 to v16.3.8. Apps keep building with Webpack for now; the switch to Turbopack will ship separately.

## 0.1.1

### Patch Changes

- 60f11e2: Upgrade next.js to 16.3.8 or 15.5.27

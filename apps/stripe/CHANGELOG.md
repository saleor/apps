# saleor-app-payment-stripe

## 2.3.12

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 2.3.11

### Patch Changes

- ea7fad59: Changed errors that were printed due to API rejection to be warnings, because they are usually bad payload from storefront
- 2a4f27ad: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 2.3.10

### Patch Changes

- be1fcf20: Fixed race condition in transaction recording that caused `ConditionalCheckFailedException` errors.
  Previously, when two concurrent requests with the same idempotency key arrived (e.g., user clicking pay button multiple times),
  the second request would fail with a DynamoDB error.
  Now, duplicate write attempts are treated as idempotent success since Stripe already ensures the payment intent is not charged multiple times.

## 2.3.9

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 2.3.8

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3

## 2.3.7

### Patch Changes

- 98459d79: Updated Next.js to 15.2.6
- b1f10da0: Added logs when app fails to install due to error in APL, or due to disallowed domain and when app installs successfully
- Updated dependencies [98459d79]
  - @saleor/apps-logger@1.6.2
  - @saleor/apps-otel@2.3.1
  - @saleor/react-hook-form-macaw@0.2.16
  - @saleor/apps-shared@1.14.1
  - @saleor/apps-trpc@4.0.4
  - @saleor/apps-ui@1.3.2

## 2.3.6

### Patch Changes

- 2f3ca93e: Changed legacy-webhook management logic to use "warn" instead of "error" for logs.

## 2.3.5

### Patch Changes

- 27a4d622: Attach errors to trpc handlers for better debugging

## 2.3.4

### Patch Changes

- f53f6e23: Added logs when app installation fails.

## 2.3.3

### Patch Changes

- f531475b: Added additional logging to UpdateMapping handler. Previously no logs were issues when error occured which prevented proper debugging.

## 2.3.2

### Patch Changes

- baf821a9: Fix logger message when canceling payment intent.

## 2.3.1

### Patch Changes

- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 2.3.0

### Minor Changes

- 6b9305d3: Add support for payment method details in transaction events. The Stripe app now fetches and includes payment method information (card brand, last digits, expiration date, etc.) when reporting transaction events to Saleor. This feature is only available for Saleor 3.22+ and includes:

  - New `SaleorPaymentMethodDetails` class for converting Stripe payment method data to Saleor format
  - Automatic fetching of payment method details from Stripe PaymentIntent
  - Support for card payment methods (brand, last 4 digits, expiration month/year) and other payment method types
  - Payment method details included in transaction event reports sent to Saleor
  - Version compatibility check using `SaleorVersionCompatibilityValidator` to ensure the feature is only used with compatible Saleor versions

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0
  - @saleor/apps-trpc@4.0.3

## 2.2.2

### Patch Changes

- 22c28c1f: Removed unnecessary error logs that printed all non-ok responses from tRPC in the main Procedure. That is not necessary because main tRPC config already prints errors from 500 status errors. Now only one error will be logged if necessary

## 2.2.1

### Patch Changes

- d19e88fc: Fix copy for restricted key validation. After this change error text will point to proper prefix (rk) instead of (pk).

## 2.2.0

### Minor Changes

- 46ed6766: Add support for [ACH Direct Debit](https://docs.stripe.com/payments/ach-direct-debit) and [SEPA Direct Debit](https://docs.stripe.com/payments/sepa-debit) payment methods.
  Also fixed issue where app was using incorrect amount when handling processing event from Stripe (previously it was using `amount_received` and after this change it is using `amount` from Stripe event).

### Patch Changes

- 08c22078: Client error with invalid data provided from the storefront now is logged as warning (instead of error). Additionally, data with expected payment method is now printed in log.

## 2.1.3

### Patch Changes

- 45be18b8: Pass metadata to Stripe when creating PaymentIntents to fix webhook validation errors.

## 2.1.2

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1
  - @saleor/apps-trpc@4.0.3

## 2.1.1

### Patch Changes

- 4c6ab870: Used DynamoAPL from app-sdk instead local package.

## 2.1.0

### Minor Changes

- 30813d53: Events from Stripe that doesn't contain metadata are now gracefully ignored. App will not try to proceed such event, which eventually ended with TransactionNotFound error. Instead it's early returned, not DB is called and proper status is returned to Stripe.

## 2.0.7

### Patch Changes

- 7a834f53: Used shared EmptyConfigs component form @saleor/apps-ui
- 674b4fa0: Fixed issue with multiple modal rendering. Used shared modal content
- b1c0139a: Use ConfigsList from shared package
- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 2.0.6

### Patch Changes

- fe605010: Update DynamoDB Toolbox to > v2, no function changes introduced
- b07a2e12: Extract DynamoDB APL to shared package
- Updated dependencies [b07a2e12]
  - @saleor/apl-dynamo@2.0.0
  - @saleor/apps-logger@1.6.1

## 2.0.5

### Patch Changes

- 00070dc3: Move Encryptor to @saleor/apps-shared
- c9d8b68c: Move generated types from JSON schema to `generated/app-webhooks-types` folder.
- Updated dependencies [00070dc3]
  - @saleor/apps-shared@1.13.0
  - @saleor/apps-trpc@4.0.3

## 2.0.4

### Patch Changes

- 339fbd95: Fixed new config validation - now it will earlier catch mismatched PK and RK (live + test mix) and Sentry will not be called
- 799be59a: Added generated types from Saleor JSON schemas for webhooks. Fixed missing actions for TransactionInitializeSession. After this change staff user can cancel transaction even if there is no payment made but payment intent has been created.
- Updated dependencies [d3702072]
- Updated dependencies [c68f1e9f]
  - @saleor/apps-logger@1.6.0
  - @saleor/apps-otel@2.3.0

## 2.0.3

### Patch Changes

- 68425b40: Updated how app handles transaction not found in internal DB - after this change app will responds with 400 status code meaning that Stripe won't retry webhook request.
- b5420bcf: Add additional Sentry / observability attributes
- 5b4a6f36: Fixed broken validation for PK and RK on the UI side. Now prefix is validated for early feedback
- c1a04e31: Fixed Stripe webhook route handler not wrapped in app context & added saleorApiUrl to Sentry when handling tRPC errors.

## 2.0.2

### Patch Changes

- a8cd0eb5: Move building command to DynamoDB into try / catch. After this change when building command fails user will see better error message instead of generic one.
- 847f8095: Change DynamoDB transaction recorder repo log for error to debug.

## 2.0.1

### Patch Changes

- af4f38ec: App doesn't throw anymore when ID from Stripe doesn't match expected format. Previously app was checking format like "pk*live*" or "whsec\_". Now it will inform Sentry that it faced unexpected value, but continue to work.

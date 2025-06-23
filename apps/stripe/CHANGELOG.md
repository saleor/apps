# saleor-app-payment-stripe

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

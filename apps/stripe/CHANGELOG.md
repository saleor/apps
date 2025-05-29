# saleor-app-payment-stripe

## 2.0.2

### Patch Changes

- a8cd0eb5: Move building command to DynamoDB into try / catch. After this change when building command fails user will see better error message instead of generic one.
- 847f8095: Change DynamoDB transaction recorder repo log for error to debug.

## 2.0.1

### Patch Changes

- af4f38ec: App doesn't throw anymore when ID from Stripe doesn't match expected format. Previously app was checking format like "pk*live*" or "whsec\_". Now it will inform Sentry that it faced unexpected value, but continue to work.

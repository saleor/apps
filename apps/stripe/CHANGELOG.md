# saleor-app-payment-stripe

## 2.0.1

### Patch Changes

- af4f38ec: App doesn't throw anymore when ID from Stripe doesn't match expected format. Previously app was checking format like "pk*live*" or "whsec\_". Now it will inform Sentry that it faced unexpected value, but continue to work.

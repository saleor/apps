---
"saleor-app-payment-stripe": minor
---

Add support for payment method details in transaction events. The Stripe app now fetches and includes payment method information (card brand, last digits, expiration date, etc.) when reporting transaction events to Saleor. This feature is only available for Saleor 3.22+ and includes:

- New `SaleorPaymentMethodDetails` class for converting Stripe payment method data to Saleor format
- Automatic fetching of payment method details from Stripe PaymentIntent
- Support for card payment methods (brand, last 4 digits, expiration month/year) and other payment method types
- Payment method details included in transaction event reports sent to Saleor
- Version compatibility check using `SaleorVersionCompatibilityValidator` to ensure the feature is only used with compatible Saleor versions

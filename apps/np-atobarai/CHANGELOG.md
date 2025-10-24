# saleor-app-payment-np-atobarai

## 1.1.1

### Patch Changes

- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 1.1.0

### Minor Changes

- 82acd5e2: Add support for payment method details in transaction events. The NP Atobarai app now includes payment method information when reporting transaction events to Saleor. This feature is available for Saleor 3.22+ and includes:

  - New `SaleorPaymentMethodDetails` class for formatting NP Atobarai payment method data to Saleor format
  - Payment method details included in transaction-initialize-session webhook responses
  - Payment method details included in transaction-process-session webhook responses
  - Comprehensive unit test coverage with snapshot testing to ensure correct payment method structure

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0
  - @saleor/apps-trpc@4.0.3

## 1.0.0

### Major Changes

- a123d625: Production release of NP Atobarai App. To learn more about the app check [Saleor](https://docs.saleor.io/developer/app-store/apps/np-atobarai/overview) docs.

## 0.0.6

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1
  - @saleor/apps-trpc@4.0.3

## 0.0.5

### Patch Changes

- 4c6ab870: Used DynamoAPL from app-sdk instead local package.

## 0.0.4

### Patch Changes

- 7a834f53: Used shared EmptyConfigs component form @saleor/apps-ui
- b1c0139a: Use ConfigsList from shared package
- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 0.0.3

### Patch Changes

- Updated dependencies [b07a2e12]
- Updated dependencies [44a9bfd3]
- Updated dependencies [b07a2e12]
  - @saleor/apl-dynamo@2.0.0
  - @saleor/dynamo-config-repository@1.0.0
  - @saleor/errors@1.0.0
  - @saleor/apps-domain@1.0.1
  - @saleor/apps-logger@1.6.1

## 0.0.2

### Patch Changes

- Updated dependencies [277d3773]
- Updated dependencies [00070dc3]
  - @saleor/apps-domain@1.0.0
  - @saleor/apps-shared@1.13.0
  - @saleor/apps-trpc@4.0.3

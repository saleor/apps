# saleor-app-payment-np-atobarai

## 1.3.2

### Patch Changes

- 9c46f935: Changed refund logic that improperly matched refunds - now it uses transaction total instead order total to decide if refund is full

## 1.3.1

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 1.3.0

### Minor Changes

- 0c477d55: Added granular error handling, which will return more precise error messages in cases of errors. Also many errors were handled, meaning "status 200" will be returned in case of valid event, that misses necessary data like payload required to process the request. Previously it was not handled and caused "status 500" reported to Saleor.

### Patch Changes

- 1577f747: Added more verbose error for sdk webhook execution, this should help debugging early request validation
- 2a4f27ad: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 1.2.9

### Patch Changes

- 214974b2: Fixed Zod validation errors raising exceptions. Validation errors in customer data, delivery destination, and money fields now return warnings instead of throwing exceptions, preventing HTTP 500 responses to Saleor webhooks.
- 214974b2: Renamed `MalformedRequestResponse` to `InvalidEventDataResponse` to better reflect its purpose. This response is used for validation errors in event data, not malformed payloads.

## 1.2.8

### Patch Changes

- 204d4889: Fixed HTTP 500 errors when customer data (email, phone, billing address) is missing.
  These validation errors now return HTTP 202 instead, preventing Saleor webhook circuit breaker from disabling payment webhooks.
- c5850b91: Zod validation errors will no longer cause app to throw unexpected exception, and instead will be properly handled.
  Previously they were not caught and caused app to send `logger.error`

## 1.2.7

### Patch Changes

- e2eb32bb: Additionally print warning logs for raw Atobarai responses

## 1.2.6

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 1.2.5

### Patch Changes

- c0533509: Removed unnecessary error log (duplicated) for trpc

## 1.2.4

### Patch Changes

- f25d5c2c: Loosen validation of Atobarai error response. Now app will accept shape of errors containing arbitrary strings, without expecting their specific literal value.
- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3
  - @saleor/dynamo-config-repository@1.0.2

## 1.2.3

### Patch Changes

- 7c891443: App will now return `apiError` field that (if available) comes from Atobarai API. It will be returned in TransactionInitializeSession and TransactionProcessSession webhook responses, together with existing errors. Error codes are internal to Atobarai API and can be verified in relevant API docs

## 1.2.2

### Patch Changes

- 8687dd7d: Accept zipcode with format "xxx-xxxx" (dash). Previously app was throwing internally, because address library was expecting different format.

## 1.2.1

### Patch Changes

- 985bcfaa: Fallback to original address city and city area if zip code can't be resolved

## 1.2.0

### Minor Changes

- 9fda34e8: App is now using official Japanese post database to resolve city and neighbourhood from the provided zipcode

### Patch Changes

- c91ab827: Fixed formatting address resolved for Atobarai - it will include city & city area
- 98459d79: Updated Next.js to 15.2.6
- b1f10da0: Added logs when app fails to install due to error in APL, or due to disallowed domain and when app installs successfully
- Updated dependencies [98459d79]
  - @saleor/apps-domain@1.0.2
  - @saleor/dynamo-config-repository@1.0.1
  - @saleor/errors@1.0.1
  - @saleor/apps-logger@1.6.2
  - @saleor/apps-otel@2.3.1
  - @saleor/react-hook-form-macaw@0.2.16
  - @saleor/apps-shared@1.14.1
  - @saleor/apps-trpc@4.0.4
  - @saleor/apps-ui@1.3.2

## 1.1.3

### Patch Changes

- 3f2e2f51: Changed some of Saleor webhook response statuses.

  Previously, app either returned 5xx (if we expect Saleor to retry) or 4xx (if we can't process, for various reasons, but we don't want a retry).

  Due to upcoming Saleor Circuit Breaker mechanism, we no longer can rely on 4xx status for every case. After this change, app will sometimes return status 202 in case of error.

  For example - when app is not configured, it's expected that 4xx is returned and Saleor will disable not configured app eventually. But in case of webhooks that are not processable _sometimes_,
  app will return ACCEPTED code and exit gracefully. This way, Saleor will not disable healthy webhooks, that can't be process under certain conditions

## 1.1.2

### Patch Changes

- ac8ee7c7: Changed errors handling - now MalformedRequest returns 400 (as expected) instead of 500. This way we clearly distinguish between application failure and request that can't be processed. Additionally for async webhooks, Saleor will not retry the request. Also, errors from Atobarai API are logged as warnings, because usually they are related to incorrect business data (like addresses) - hence app should not indicate failures

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

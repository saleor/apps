# app-avatax

## 1.0.2

### Patch Changes

- fa478d2b: Gracefully handle cases, where checkout/order in webhooks misses address and/or lines. These scenarios are possible when app is reached with partial checkout/order. It can happen when user haven't yet entered address or added lines. App will check this and return proper error with status 400
- 1e07a6ff: Applied "logger context" that allows api handlers to share fields in the invocation context. It helps to avoid "prop drilling". This context will be sent with Open Telemetry logs attributes
- cb620765: Unified the shipping line logic. Reading and creating a shipping line is now in `avatax-shipping-line.ts`.
- Updated dependencies [1e07a6ff]
  - @saleor/apps-logger@1.2.0

## 1.0.1

### Patch Changes

- 0f3e6fbe: Improved error handling in CHECKOUT_CALCULATE_TAXES flow. After this change, errors logged will have better, more verbose structure. Messages sent to Saleor will be also more self explaining
- 67afe8e4: Apps that use OTEL can now collect and send spans containing details about GraphQL requests.
- Updated dependencies [67afe8e4]
- Updated dependencies [67afe8e4]
  - @saleor/apps-shared@1.9.3
  - @saleor/apps-otel@1.1.0

## 1.0.0

### Major Changes

- af4ad5c: Extracted Avatax App from Taxes app. Now app is standalone app just for Avatax. Code for Taxjar was removed. Taxjar app is accessible in its dedicated Taxjar app now.

### Patch Changes

- 07b3066: Empty changeset

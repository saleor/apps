# saleor-app-taxes

## 1.5.0

### Minor Changes

- 0c039f5: Make companyCode optional in Avatax.

### Patch Changes

- b4ddb02: Fix quantity not respected when calculating taxes.
- 9ecb629: Fix channels not showing in the channels list if there are too many of them.
- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 1.4.0

### Minor Changes

- 9eacc88: Map new fields from Saleor to Avatax (e.g. discounts, itemCode, description).
- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL
- 3347a30: Add "Shipping tax code" field to Avatax configuration form. Allows to customize the tax code set on the "shipping" item.

### Patch Changes

- 830cfe9: Replaced internal logger implementation with shared logger
- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

## 1.3.1

### Patch Changes

- 56b27b2: Fix invalid response format in `order-calculate-taxes`.

## 1.3.0

### Minor Changes

- 57f6d41: Updated Manifest to contain up to date support, privacy, homepage and author fields
- 84e9ca5: Add `<CountrySelect />` and use it in the `channel-tax-provider-form.ts` to ensure the correct formatting of the country code.
- 453baf7: Completed the order flow with new webhooks: `order_created` and `order_fulfilled`. In TaxJar, an order will be created on `order_created` with no actions on `order_fulfilled`. In Avatax, a transaction will be created on `order_created` and commited on `order_fulfilled`.

### Patch Changes

- 2c0df91: Added lint:fix script, so `eslint --fix` can be run deliberately
- e167e72: Update next.js to 13.3.0
- 74174c4: Updated @saleor/app-sdk to 0.37.3
- 2e51890: Update next.js to 13.3.0
- 2e51890: Update @saleor/app-sdk to 0.37.2
- 2e51890: Use useDashboardNotification hook from shared package, instead of direct AppBridge usage
- Updated dependencies [2c0df91]
- Updated dependencies [e167e72]
- Updated dependencies [74174c4]
- Updated dependencies [2e51890]
- Updated dependencies [2e51890]
- Updated dependencies [2e51890]
  - @saleor/apps-shared@1.4.0

## 1.2.1

### Patch Changes

- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 1.2.0

### Minor Changes

- d55b2f9: Improve webhook processing time by adding the app config to subscription payload instead of fetching it separately.

## 1.1.1

### Patch Changes

- aa8a96a: Fix "no provider available" error while reading an updated provider.
- 907e618: Added Sentry configuration that can be enabled via env variables

## 1.1.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too
- ba40df0: Replace the apps/taxes README with link to docs.

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 1.0.3

### Patch Changes

- e93a4dc: Updated GraphQL Code Generator package

## 1.0.2

### Patch Changes

- 56a4dbb: Extracts the tax providers into individual services. Fixes the issue with updating configs with obfuscated values.
- b46a9f3: Fix the create provider error. Add explicit return types to configuration services. Move obfuscating logic to routers and public services.

## 1.0.1

### Patch Changes

- 5151858: Removed the draft implementation of the SaleorSyncWebhook. Replaced it with SaleorSyncWebhook class from app-sdk and bumped it to 0.34.1.

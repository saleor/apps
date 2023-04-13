# saleor-app-taxes

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

# saleor-app-taxes

## 1.9.0

### Minor Changes

- f96563f: Redesigned the app's UI with the new version of macaw-ui. Introduced breaking changes in the structure of providers configuration and channels configuration. Added migrations that convert the obsolete configurations to the new format. Added address validation for tax providers.
- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.
- 09e0799: Added fetching tax codes from tax providers and storing the matched combinations of the provider tax codes/Saleor tax classes. The mapped tax codes are then used in the tax calculation process.

### Patch Changes

- c4be200: The update provider configuration views no longer return "invalid credentials" and "invalid address" errors in inappropriate cases. The latter required temporarily disabling the TaxJar address validation, as it currently doesn't work.
- 860bac4: Updated @saleor/app-sdk to 0.40.1
- a1ad70e: Updated configuration and dependencies of GraphQL client - urql.
  All applications use now unified config for creating the client. Also unused related packages has been removed.
- ec68ed5: Updated Sentry package and config. Set Sentry release to match package.json version. Now Sentry will use semver version instead a commit
- cb6ee29: Updated dependencies
- e239fbb: Fixed the issue with updating a provider. When updating one of the credentials, the user no longer sees "invalid credentials" error.
- Updated dependencies [f96563f]
- Updated dependencies [f96563f]
- Updated dependencies [860bac4]
- Updated dependencies [a1ad70e]
- Updated dependencies [cb6ee29]
- Updated dependencies [a1ad70e]
  - @saleor/react-hook-form-macaw@0.2.0
  - @saleor/apps-ui@1.1.2
  - @saleor/apps-shared@1.7.2

## 1.8.2

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [928c727]
  - @saleor/apps-shared@1.7.1
  - @saleor/apps-ui@1.1.1

## 1.8.1

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/apps-shared@1.7.0

## 1.8.0

### Minor Changes

- ca43061: Adds new way of distributing discounts on items (proportional). Adds distinguishment between when TaxJar nexus was found and was not. Now, the "not found" behavior is not treated as error, and will return untaxed values. Fixes bugs: item quantity in TaxJar; when shipping = 0; pricesEnteredWithTax influences shipping price.

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.7.0

### Minor Changes

- 23b5c70: Set minimum Saleor version where app can be installed (3.9).

  Previously, app could have been installed in any Saleor, but if required taxes APIs were missing, app would crash

  Now, Saleor will reject installation if possible. If Saleor can't do it, App will check Saleor version during installation and fail it if version doesn't match

- dd799e6: Adds `resolveOptionalOrThrow` util that throws when not able to resolve an optional value. Now, when critical values from external APIs are not found, the app will crash instead of falling back to 0s.

### Patch Changes

- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 1.6.1

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- 51134a5: Fix returning 0 for line price if Avatax returns isItemTaxable: false. This happens in, f.e., certain states in the US where there is no sales tax. After the fix, the app will fall back to the original line price.
- Updated dependencies [24615cf]
- Updated dependencies [ba7c3de]
- Updated dependencies [c406318]
- Updated dependencies [e751459]
- Updated dependencies [f9ca488]
  - @saleor/apps-ui@1.1.0
  - @saleor/apps-shared@1.5.1

## 1.6.0

### Minor Changes

- 72adeb3: Changed behavior of failed webhooks. The app will now return status 500 if the operation failed. Previously, it returned status 200 with an error message in the response body.

### Patch Changes

- 70bf546: Fix the calculations of shipping price and line prices based on the `pricesEnteredWithTax` value. Before, the Tax App didn't consider the `pricesEnteredWithTax` setting. Now, it will return different values for `pricesEnteredWithTax` true/false.

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

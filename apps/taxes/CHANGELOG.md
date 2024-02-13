# saleor-app-taxes

## 1.22.0

### Minor Changes

- 6b8eb17: The app can now read the value of AvaTax's transaction `customerCode` from the `user.avataxCustomerCode` metadata field. If not provided, the app will use `user.id` for a logged-in user or the recommended fallback value.

## 1.21.2

### Patch Changes

- 50c31c2: Fixed Taxjar link to their docs - now it should open in the new tab.
- Updated dependencies [2683431]
  - @saleor/apps-logger@1.1.1

## 1.21.1

### Patch Changes

- Updated dependencies [93848f2]
- Updated dependencies [93848f2]
  - @saleor/apps-logger@1.1.0

## 1.21.0

### Minor Changes

- 0849d8e: Implemented Open Telemetry and Logger from shared packages.

### Patch Changes

- Updated dependencies [d9e4cb3]
- Updated dependencies [0849d8e]
  - @saleor/apps-otel@1.0.0
  - @saleor/apps-logger@1.0.0

## 1.20.0

### Minor Changes

- 3e1185f: Added autocomplete component to the tax code matcher. It now allows for filtering the tax codes. This fixes the issue with some tax codes never appearing in the options list. This component will be later replaced with macaw-ui Autocomplete.

### Patch Changes

- 5f564a0: Updated @saleor/app-sdk to 0.47.2

## 1.19.2

### Patch Changes

- 531e7c1: Disabled Sentry tracing and Replays by default

## 1.19.1

### Patch Changes

- 99f7066: Updated Macaw UI to 1.0.0-pre.7. Removed legacy Material UI dependency from older Macaw. Code was updated to work properly with some API changes
- Updated dependencies [99f7066]
  - @saleor/react-hook-form-macaw@0.2.6
  - @saleor/apps-shared@1.9.2
  - @saleor/apps-ui@1.2.2

## 1.19.0

### Minor Changes

- a50df02: Reduced Sentry traces sample rate to 0.1

### Patch Changes

- f4c67e8: Updated TRPC version

## 1.18.4

### Patch Changes

- fdabc51: Mapped app-sdk package to root library
- Updated dependencies [fdabc51]
  - @saleor/apps-shared@1.9.1
  - @saleor/apps-ui@1.2.1

## 1.18.3

### Patch Changes

- 148a6d7: Updated Sentry to 7.77.0

## 1.18.2

### Patch Changes

- d4fa3a4: Removed the hardcoded error message for when `order-cancelled` webhook handler fails. Split up errors to be expected/critical. Expected are not reported to Sentry.

## 1.18.1

### Patch Changes

- 6720d01: Fixed the issue when the app threw errors when unable to resolve user email. Now, if the email is not available in `order.user.email` and `order.userEmail`, the app will fall back to empty string.

## 1.18.0

### Minor Changes

- 72b4fba: Fixed the issue with the app throwing errors when no customer code was resolved in AvaTax integration. Now, it falls back to "0" which is the recommended dummy value for when it's impossible to identify a customer (e.g. in an anonymous checkout).

## 1.17.0

### Minor Changes

- 07d7d09: Improved the Sentry setup. When Sentry is successfully configured, the app should report all the events accordingly to the severity specified in the `NEXT_PUBLIC_SENTRY_REPORT_LEVEL`. All the errors now have a new property: `sentrySeverity`. The app now uses new environment variables: `VERCEL`, `VERCEL_GIT_COMMIT_SHA`, `NEXT_PUBLIC_SENTRY_REPORT_LEVEL` and `GITHUB_SHA`. To ensure the correct building of source maps, before performing a deploy to Vercel build, the app will now provide the release tag in a `SENTRY_RELEASE` env var.

## 1.16.1

### Patch Changes

- a561cb8: Fixed the issue with client logger freezing while parsing logs. Now, the logs are limited to 10 failed events.
- 949a4f5: Refactored error handling. The app now distinguishes between different types of errors:

  - `TaxIncompleteWebhookPayloadError` - thrown when data in the webhook payload is not complete enough to continue with the process.
  - `TaxBadPayloadError` - thrown when the webhook payload is not what the app expects.
  - `TaxBadProviderResponseError` - thrown when the response from the tax provider is not what the app expects.
  - `TaxExternalError` - thrown when the tax provider returns an error.

## 1.16.0

### Minor Changes

- a32fe7c: Added logs for AvaTax and TaxJar. Logs are stored in the app metadata. Only the last 100 events are stored. Each provider configuration has its own logs. You can get to them by a new button "Logs" in the provider table.

### Patch Changes

- 5d3d81d: Bumped @hookform/resolvers from 2.9.11 to 3.3.1
- 5dee65a: Updated dependencies:
  - @graphql-codegen/cli@5.0.0
- 2e29699: Updated Sentry package
- 2951fb3: [skip ci]: Bump jotai from 2.0.0 to 2.4.2

## 1.15.2

### Patch Changes

- 30140ee: Improved some text typos.
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
  - @saleor/apps-shared@1.9.0
  - @saleor/apps-ui@1.2.0

## 1.15.1

### Patch Changes

- a81f061: Updated Macaw to pre-127
- fcc37e7: Remove clsx package from the projects no longer using it.
- Updated dependencies [2a1385b]
- Updated dependencies [a81f061]
- Updated dependencies [fcc37e7]
  - @saleor/apps-shared@1.8.1
  - @saleor/react-hook-form-macaw@0.2.5
  - @saleor/apps-ui@1.1.8

## 1.15.0

### Minor Changes

- 783bd5e: Removed all the code related to the deprecated OrderCreated & OrderFulfilled flow. The migration process began in version 1.13.0. All the cloud environments had been migrated automatically.

### Patch Changes

- 34efd39: Fixed the issue when user id was not available during tax calculation. Now, to identify the user during tax calculation, we use the user email.
- 45ed9fb: Fixed the error when checkout couldn't calculate taxes when no customerCode was provided. In calculate taxes, the customerCode is now derived from issuingPrincipal's id.

## 1.14.0

### Minor Changes

- be761b2: Changed the layout in the AvaTax configuration form to consist of three sections: "Credentials", "Settings" (new) and "Address". Now, the "Credentials" section contains only fields that affect authentication.

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118
- Updated dependencies [8b3d961]
- Updated dependencies [c50797e]
  - @saleor/react-hook-form-macaw@0.2.4
  - @saleor/apps-shared@1.8.0
  - @saleor/apps-ui@1.1.7

## 1.13.1

### Patch Changes

- 3002354: Added error logging for exceptions thrown at tRPC routes.

## 1.13.0

### Minor Changes

- 416c92f: Changed `externalId` order metadata field to `avataxId`. It is now only responsible for storing the id of Avatax transaction.
- 416c92f: Added support for reading document code from metadata field `avataxDocumentCode`. The default value is the order id from Saleor. The value for the document code is sliced to be under 20 characters. The requirement comes from Avatax API.
- 416c92f: Added support for reading the tax calculation date from metadata field `avataxTaxCalculationDate`. The value has to be valid UTC datetime string (e.g. "2021-08-31T13:00:00.000Z").
- 416c92f: Added `ORDER_CANCELLED` webhook handler with an implementation for Avatax. The transactions for corresponding orders in Saleor will be voided in the Avatax dashboard.
- 416c92f: Started the migration from `OrderCreated` to `OrderConfirmed` webhook event. In the new flow, the provider transactions will be created based on the order confirmation (either automatic or manual) event. The value of the `commit` field will be set based on the "isAutocommit" setting in the provider configuration.

  The `OrderCreated` and `OrderFulfilled` handlers are deprecated. They will be removed on August 24, along with their corresponding webhooks. For now, both flows (`OrderCreated` -> `OrderFulfilled` and `OrderConfirmed`) are supported.

  **Actions needed**:

  The only scenario where you, as the user, may need to do something regarding this release is the following:

  1. You created an order that still needs to be fulfilled (therefore, the corresponding AvaTax transaction is not committed).
  2. You are planning to fulfill the order after August 23 (which is the date when we will complete the migration).

  In that case, **remember you will not be able to commit the transaction by fulfilling the order in Saleor**. In the new flow, the transactions are committed in AvaTax while confirming the Saleor order, based on the "isAutocommit" flag. What you have to do is the following:

  1. Make sure "isAutocommit" is set to true.
  2. Trigger the `OrderConfirmed` event (either by [`orderConfirm` mutation](https://docs.saleor.io/docs/3.x/api-reference/orders/mutations/order-confirm) or in the Dashboard).

  The AvaTax transaction created on the `OrderCreated` event should be updated with `commit: true`.

  You can read more about the webhook flow in the Taxes App and the migration itself in [our documentation](https://saleor-docs-git-taxes-order-created-to-confirmed-saleorcommerce.vercel.app/docs/3.x/developer/app-store/apps/taxes/architecture#migration).

## 1.12.1

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged
- Updated dependencies [261957f]
  - @saleor/react-hook-form-macaw@0.2.3
  - @saleor/apps-shared@1.7.6
  - @saleor/apps-ui@1.1.6

## 1.12.0

### Minor Changes

- a725720: Added the possibility to pass entityUseCode as order `avataxEntityCode` metadata field. This makes tax exempting groups of customers possible.

## 1.11.0

### Minor Changes

- ce60887: Added "document recording" toggle. It is turned on by default. When turned off, the document type of all Avatax transactions change to "SalesOrder", making them not record. Read more about document recording [here](https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/disable-document-recording/).
- 5a4da7b: Changed the avatax configuration flow. Previously, the configuration was validated when trying to create it. Now, you have to verify the credentials and address manually by clicking the "verify" buttons. If the address was resolved successfully, formatting suggestions provided by Avatax address resolution service may be displayed. The user can apply or reject the suggestions. If the address was not resolved correctly, an error will be thrown.

### Patch Changes

- 2fab86b: Updated graphql package to 16.7.1 and @graphql-codegen related dependencies to the latest version.
- aa6fec1: Updated Macaw UI to pre-106
- Updated dependencies [aa6fec1]
- Updated dependencies [aa6fec1]
  - @saleor/react-hook-form-macaw@0.2.2
  - @saleor/apps-shared@1.7.5
  - @saleor/apps-ui@1.1.5

## 1.10.1

### Patch Changes

- 70cb741: Update Zod to 3.21.4
- e7c2d3a: Updated and ESLint dependencies
- 3c6cd4c: Updated the @saleor/app-sdk package to version 0.41.1.
- 6210447: Updated tRPC packages to 10.34.0
- 6210447: Updated @tanstack/react-query 4.29.19
- Updated dependencies [70cb741]
- Updated dependencies [e7c2d3a]
- Updated dependencies [3c6cd4c]
- Updated dependencies [6210447]
  - @saleor/react-hook-form-macaw@0.2.1
  - @saleor/apps-shared@1.7.4
  - @saleor/apps-ui@1.1.4

## 1.10.0

### Minor Changes

- a1f083c: Filled "about" field in App Manifest. Dashboard will display it in app details page now.
- d2b21cc: Added the usage of stored tax code combinations in the create order webhook flow. This doesn't effect the tax calculation, but makes sure the mapped product line has the correct tax code.
- 47102ba: Added additional ENV variables (see each app's .env.example), that can overwrite app base URL. This change allows easy apps development using Docker

### Patch Changes

- 2d77bca: Updated Next.js to 13.4.8
- 6299e06: Update @saleor/app-sdk to 0.41.0
- Updated dependencies [2d77bca]
- Updated dependencies [6299e06]
  - @saleor/apps-shared@1.7.3
  - @saleor/apps-ui@1.1.3
  - @saleor/react-hook-form-macaw@0.2.0

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

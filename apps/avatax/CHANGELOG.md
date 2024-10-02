# app-avatax

## 1.10.3

### Patch Changes

- 630c68ad: Refactored so called "webhook service" class. Now each webhook creates it's own dependencies. It's a part of larger refactor that aims to simplify app's architecture. No functional change is expected.
- 3896e777: Remove deprecated Saleor version checking on AvaTax register endpoint. Currently Saleor checks if app can be installed for given env on manifest fetching.
- 186bad79: Added TransactionAlreadyCancelled support for AvaTax app while canceling Saleor order.
- Updated dependencies [f1025fae]
  - @saleor/apps-otel@1.3.3

## 1.10.2

### Patch Changes

- 6d30555d: Wrapped all webhooks with metadata cache. It will cache metadata coming from the subscription and all further metadata calls from the webhook will be cached during the request

## 1.10.1

### Patch Changes

- 7a2384b3: Added serverComponentsExternalPackages to Next.js config in order to fix functions timeouts. Packages added are from `@aws/sdk-*`

## 1.10.0

### Minor Changes

- 3a2aed81: Experimental: Added client logs feature. `FF_ENABLE_EXPERIMENTAL_LOGS` variable must be set to `"true"`

  When enabled, app will required configured DynamoDB table. See readme for details.

  Client logs store business transactions in the persistent storage. Operations like taxes calculation or corresponding failures will be written.

  Logs can be accessed via App's configuration page in Saleor Dashboard.

### Patch Changes

- def3bb15: Fix Eslint issues. It won't affect AvaTax app functionality.
- dff6d8de: Improved error parser class constructor: now `parse` method will have optional parameter of error capture instead of constructor. This change will not have effect on clients.
- 5f61e627: Add handling for error occurred due to missing document in AvaTax during cancel (voiding)
- Updated dependencies [93969b2a]
  - @saleor/apps-otel@1.3.2

## 1.9.1

### Patch Changes

- fe5d5d5e: Updated @saleor/app-sdk to 0.50.3. This version removes the limitation of body size for the webhook payloads.
- 3c974d3f: Attach orderId attribute to order-confirmed logs

## 1.9.0

### Minor Changes

- 4dc63f13: Implemented new discount strategy - for SHIPPING and SUBTOTAL values

  Now, App will do following logic:

  - For line items that represent products, we use [automatic distribution](https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/), so App will not modify amounts, but will mark lines as "discounted: true" and generate "discount" field that will sum all relevant discounts
  - For shipping line item, app will use [price reduction](https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/), meaning shipping line will _not_ be marked as discounted, but the discount will be subtracted from the amount of the shipping line.

  See updated docs [here](https://docs.saleor.io/developer/app-store/apps/avatax/configuration#discounts)

- f803af6b: Minimal required Saleor version has been upgraded and now it's 3.19.

### Patch Changes

- 3bc35184: Fixed error that was thrown when app was used without channels mapping. Now error is handled properly.
- e03f703f: Added extra error handling for Public Metadata mutation of the Order.

## 1.8.3

### Patch Changes

- 8fb5ea61: Migrate from country select into country combobox when configuring AvaTax app. It should be easier to search for countries instead of selecting them from long list.
- 63f6bbfd: Refactor: Extracted dependencies to the highest possible creation place. This should not introduce any functional change
- 45a47156: Updated @saleor/app-sdk to 0.50.2. No functional changes are introduced

## 1.8.2

### Patch Changes

- 6fed4b19: Migrate to new newest MacawUI version. Functionally nothing has changed. UI may look a bit different but it will be on par with Dashboard UI.
- Updated dependencies [6fed4b19]
  - @saleor/react-hook-form-macaw@0.2.10
  - @saleor/apps-shared@1.11.2
  - @saleor/apps-ui@1.2.8

## 1.8.1

### Patch Changes

- c79967ab: Fix AvaTax app tax rate precision. Previously tax rate was send with 2 decimal places to Saleor, now it will be send with 6 decimal places (max of what AvaTax API returns).

## 1.8.0

### Minor Changes

- 742a59a2: Changed how AvaTax app reports non-taxable lines (shipping & product) to Saleor:
  - Now, the total gross and net amount will take into consideration discounts (if applied).
  - The tax rate for such lines will always be 0.

### Patch Changes

- ba2c21f5: "Not permitted" error when fetching AvaTax tax codes is now handled as client-error. Request will respond with 403 and message will be returned to the frontend
- ef831404: Handle AvataxEntityNotFoundError error in app instead logging it to Sentry.
- b5433cbc: Applied code reformatting on the codebase. This should not have any visible effect

## 1.7.8

### Patch Changes

- 5d132b2b: Added fallback behavior for Tax Code Matcher: scenario when AvaTax fail to respond with available tax classes.

  ### Before:

  When AvaTax failed to respond, app left Tax Code Matcher page and settings couldn't been set

  ### After

  App ignores missing response from AvaTax and sets empty autocomplete results. Values can be entered manually and will not be validated

- 534bde05: Add logs to AvaTax app logic that transforms Avalara response to Saleor.

## 1.7.7

### Patch Changes

- 66b4f3b5: Add logs around tax code matcher. Now it's more visible what operations are executed

## 1.7.6

### Patch Changes

- 47ab5ef1: Remove not needed log for order calculate taxes that logged email.
- 2192c555: Remove not used dependencies.

## 1.7.5

### Patch Changes

- ea25bb83: Updated dependencies responsible for error handling.
- b789f8d3: Handle GetTaxError from AvaTax when handling order confirmed event. Right now app will return 400 status code with description what happened.

## 1.7.4

### Patch Changes

- 5d68c00a: Added configuration that should help with cold starts of AvaTax app functions.

## 1.7.3

### Patch Changes

- 8ffaba30: Added `FILE_APL_PATH` env variable. It can be used to specify file name of file where file APL will be stored.
- 16f9985a: Switch webhook migration to parallel mode. Releases and migrations should be faster now.

## 1.7.2

### Patch Changes

- e9c9c329: Add support for AvataxStringLengthError while processing order calculate taxes. Right now app will return 400 in such case.
- 17077505: Updated TypeScript version to 4.5.4.
- e9c9c329: Add support for AvataxStringLengthError to order calculate taxes webhook. When app gets this error from AvaTax it will return 400 with description of the issue.
- Updated dependencies [17077505]
  - @saleor/react-hook-form-macaw@0.2.9
  - @saleor/webhook-utils@0.1.4
  - @saleor/sentry-utils@0.2.3
  - @saleor/apps-logger@1.2.9
  - @saleor/apps-shared@1.11.1
  - @saleor/apps-otel@1.3.1
  - @saleor/apps-ui@1.2.7

## 1.7.1

### Patch Changes

- c77d1c5c: Add log to register endpoint. It will help us with spotting new clients using an app.
- bedc1674: Add support for AvaTax string validation error. This helps us with better error handling.
- 5670c6ed: Send JSON instead of string when webhook has non 200 response. This will help Saleor in displaying better logs.

## 1.7.0

### Minor Changes

- ba981a73: Fixed discount logic. After this change AvaTax app will send Saleor discounts to Avalara for automatic distribution when handling calculate taxes webhook for order and checkout. Discount logic when confirming order will remain unchanged - AvaTax app will use price reduction discounts and sends totalPrice from Saleor.

### Patch Changes

- Updated dependencies [6f2d6abb]
  - @saleor/apps-otel@1.3.0

## 1.6.3

### Patch Changes

- fbdbaa28: Remove custom Next.js + Sentry error. It was causing non existing paths to be reported as 500 instead of 404. We catch Sentry errors in implicit anyway in api routes.
- 5d05e7f2: Add TaxDiscount to TaxBase subscription for Avatax app checkout & order calculate taxes.
- Updated dependencies [fbdbaa28]
  - @saleor/sentry-utils@0.2.2

## 1.6.2

### Patch Changes

- 2f59041c: Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately
- Updated dependencies [2f59041c]
  - @saleor/sentry-utils@0.2.1

## 1.6.1

### Patch Changes

- 0c4ba39f: Update next.js config after Sentry rollback.
- Updated dependencies [0c4ba39f]
- Updated dependencies [0c4ba39f]
- Updated dependencies [5c851a6c]
  - @saleor/apps-otel@1.2.2
  - @saleor/apps-logger@1.2.8

## 1.6.0

### Minor Changes

- 1a9912f5: Vercel's duration limit was increased to 25s, so we give more time to Sentry to flush the logs
- c4dcb863: Remove Pino logger library. It was already deprecated but for non migrated apps it was causing build errors. Right now we have one logger - @saleor/app-logger pkg.
- 1a9912f5: Setup Sentry inside Next.js instrumentation file. It ensures that Sentry works properly for serverless environment.

### Patch Changes

- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.
- cc047b1d: Downgraded Sentry package to v7. Previous upgrade to 8.x cause Sentry to conflict with Open Telemetry setup and Sentry was not working
- Updated dependencies [37ecb246]
- Updated dependencies [c4dcb863]
- Updated dependencies [1a9912f5]
  - @saleor/apps-logger@1.2.7
  - @saleor/apps-otel@1.2.1
  - @saleor/react-hook-form-macaw@0.2.8
  - @saleor/sentry-utils@0.2.0
  - @saleor/apps-shared@1.11.0
  - @saleor/apps-ui@1.2.6
  - @saleor/webhook-utils@0.1.3

## 1.5.3

### Patch Changes

- 424d2ea7: App now properly extracts tax rate amount (float number, like 0.23) from Avatax response and attaches it to webhook response. If field doesn't exist in Avatax, it falls back to 0 (like it was before)
- cdae73a9: Removed addresses data (from & to) from logger messages
- e7b909ed: Update Avatax app Sentry configuration
- Updated dependencies [e7b909ed]
  - @saleor/sentry-utils@0.1.0

## 1.5.2

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1
- Updated dependencies [64d88b24]
- Updated dependencies [5cbd3b63]
- Updated dependencies [e1ea31be]
  - @saleor/react-hook-form-macaw@0.2.7
  - @saleor/webhook-utils@0.1.2
  - @saleor/apps-logger@1.2.6
  - @saleor/apps-shared@1.10.3
  - @saleor/apps-otel@1.2.0
  - @saleor/apps-ui@1.2.5

## 1.5.1

### Patch Changes

- d1dcbcc0: Improve handling of errors from AvaTax API. Right now there is `AvataxErrorsParser` responsible for parsing errors from AvaTax into our internal ones. We also have `AvataxErrorToTrpcErrorMapper` which maps internal Avatax error into TRPC one.

## 1.5.0

### Minor Changes

- 282d6d9d: Change discounts flow to price reduction. It means that Saleor is responsible for calculating discounted prices and Avatax will receive totalPrice (discounted or not) to calculate taxes.

### Patch Changes

- 4ffef6be: Update `@sentry/nextjs` to 8.0.0 version. It should help us with attaching additional data to Sentry errors.
- 2604ce1e: Updated Next.js to 14.2.3
- 705a6812: Send additional properties from captured errors into Sentry. This should help us with debugging issues.
- d34de22a: Don't send handled error for `checkoutCalculateTaxes` event into Sentry. It will be logged instead.
- Updated dependencies [4ffef6be]
- Updated dependencies [2604ce1e]
  - @saleor/apps-logger@1.2.5
  - @saleor/webhook-utils@0.1.1
  - @saleor/apps-shared@1.10.2
  - @saleor/apps-ui@1.2.4
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 1.4.6

### Patch Changes

- 44c9043b: Refactored order confirmed transformer. Now it will take value object SaleorOrderConfirmedEvent that should implement business logic.
- 7fcadca6: Added Sentry & error logging for a case when we have an error on Saleor GraphQL subscription. It should help us in spotting issues.
- 827be8c8: Updated avatax app to reflect changes from webhoook-utils. Now migration script will log its messages to OTEL.
- Updated dependencies [eec25524]
- Updated dependencies [827be8c8]
  - @saleor/apps-logger@1.2.4
  - @saleor/webhook-utils@0.1.0

## 1.4.5

### Patch Changes

- 7902ddee: Added more data to logs when app is calling AvaTax

## 1.4.4

### Patch Changes

- Updated dependencies [528b981e]
  - @saleor/apps-logger@1.2.3

## 1.4.3

### Patch Changes

- 0f9874aa: Add logs to cancel order webhook in Avatax
- 9119aa46: Add log that will print anonymized app config once its retrieved in the webhook
- 4fc1f36d: Warning log about missing shipping line is now INFO. Its valid business case where shipping is missing so app shouldn't warn about it
- 2f995310: Fix tax class id log - now it should be clear what is default tax class id.
- 8378f439: Avatax app no longer throws an error when not an Avatax order is cancelled.

## 1.4.2

### Patch Changes

- 6bdc1332: Changed how app resolves `avataxCustomerCode`:
  1. Checkout or Order metadata (`avataxCustomerCode` key).
  2. User metadata (`avataxCustomerCode` key).
  3. User id.
  4. As a fallback app sends `0` to Avatax.
- a82631f0: Added more logging for Avatax app tax code matcher. App now is more explicit and sends `P0000000` as default tax class id to Avatax.
- 3c6ff94d: Improve logging for AvataxCustomerCodeResolver.
- a5ef57cc: Attach Sentry to tRPC errors. This will help us with catching unhandled exceptions.

## 1.4.1

### Patch Changes

- f22f2b8a: Combine `APP_LOG_LEVEL` variable for `pino` & `tslog` libraries. After this change `APP_LOG_LEVEL` will take string which is one of `silent | trace | debug | info | warn | error | fatal`.
- 5d8c7e9b: App environment and version should be now send properly to Sentry.
- d011ef05: Update Node.js version to 20.11
- 5f0f8b79: Added dynamic loading of business services in webhooks. Now, when webhook is executed for incomplete payload (like missing address or lines), handler will return early. If payload is complete, further services will be loaded dynamically. This change speed up Vercel cold start by ~7s.
- 93a03072: Add bundle-analyzer to Next.js config. Now with an ANALYZE_BUNDLE env, bundle size report will be generated during the build
- Updated dependencies [f22f2b8a]
- Updated dependencies [df03c571]
  - @saleor/apps-logger@1.2.2
  - @saleor/apps-shared@1.10.1
  - @saleor/webhook-utils@0.0.7

## 1.4.0

### Minor Changes

- 5f86c2e7: Fixed bug when app sends wrong information to Avatax indicating if tax is included in prices. After this change app will get this information from Saleor.

### Patch Changes

- 95d3b9e6: Avatax app now has new e2e tests for channels that have `pricesEnteredWithTax: True`. The tests include order and checkout creation.
- 0b158170: Fixed issue when `totalPrice` was set to 0 when checkout did not have address. After this change app will return `totalPrice` as fallback for `gross` and `net` so storefront user won't be confused with prices being 0.
- f7ecb7bd: Logger context can now pass path and project_name to help with debugging
- 04a11abd: Avatax app no longer creates new transactions if Saleor is set to use flat rates.
- ce6d61d2: Add handling for Avatax error that was raised when app was configured incorrectly. For now only invalid zip code handling was added. This error will be logged as "warning" and Sentry will not be triggered. Other, not handled errors will raise Sentry exceptions
- Updated dependencies [0a441ac9]
- Updated dependencies [f7ecb7bd]
  - @saleor/apps-logger@1.2.1

## 1.3.0

### Minor Changes

- 4f2c17c0: Added caching to App Metadata. Now, when webhook is called by Saleor, metadata from payload will be cached and consumed in MetadataManager. If cache doesn't exist, MetadataManager will fetch missing metadata. This change removes unnecessary graphql call that was timing out the handler.

## 1.2.0

### Minor Changes

- a4d35fe8: Removed "Client Logs" feature. It was effectively breaking taxes calculation, because it performed heavy data+network operations during short time period of a webhook execution.

### Patch Changes

- c6e6c1f2: Cleanup `WebhookResponse.error` function - now it won't capture exception to Sentry. Instead you should use `Sentry.captureException` explicitly when there is unhandled exception.
- e3c44c5e: Changed maximum timeout on Avatax client calls to 15s from 5s

## 1.1.0

### Minor Changes

- b29318a2: Currently, Dashboard requires from a user to have "MANAGE_APPS" to have access to the apps tab.
  Since the release 3.20 Dashboard will allow all users to access to apps tabs without checking permission.
  This means that apps will be checking if the user has "MANAGE_APPS" internally and show message "You do not have permission to access this page" if the user does not have the permission.
- 0f1a38d1: Avatax app will now send `productVariantId` from `OrderLine` to Avatax if there is no `productSku` while processing `ORDER_CREATED` webhook.

### Patch Changes

- 4a898bfa: Add `issuedAt` and `version` fields to GraphQL subscriptions. This enhance our logs with debug information.
- 23a57e21: Avatax app now uses shipping address for order tax calculations
- Updated dependencies [b29318a2]
  - @saleor/apps-shared@1.10.0
  - @saleor/webhook-utils@0.0.6

## 1.0.4

### Patch Changes

- cacd0a4d: Added additional logs to taxes calculation path. Some logs were changed from "debug" to "info", so further debugging should be easier now. Additionally, these logs will now include order/checkout ID
- 29d10d4a: Update Next.js to version 14.1.0.
- Updated dependencies [29d10d4a]
  - @saleor/apps-shared@1.9.4
  - @saleor/apps-ui@1.2.3
  - @saleor/apps-logger@1.2.0
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 1.0.3

### Patch Changes

- 27df4d8b: Adjusted Vercel setup (via vercel.json) to limit lambdas resource: 320MB and 22s for sync webhooks
- 3d5d17a0: Add handling of WrongChannelError for OrderConfirmed event. Now false-positive error will not be thrown

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

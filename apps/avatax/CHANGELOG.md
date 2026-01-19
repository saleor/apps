# saleor-app-avatax

## 1.21.9

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 1.21.8

### Patch Changes

- 3a5d102e: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 1.21.7

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 1.21.6

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3

## 1.21.5

### Patch Changes

- 98459d79: Updated Next.js to 15.2.6
- b1f10da0: Added logs when app fails to install due to error in APL, or due to disallowed domain and when app installs successfully
- Updated dependencies [98459d79]
  - @saleor/apps-logger@1.6.2
  - @saleor/apps-otel@2.3.1
  - @saleor/react-hook-form-macaw@0.2.16
  - @saleor/sentry-utils@0.2.5
  - @saleor/apps-shared@1.14.1
  - @saleor/apps-ui@1.3.2
  - @saleor/webhook-utils@0.2.6

## 1.21.4

### Patch Changes

- 8de99889: Adding support to overwrite the shipFrom address in the avatax calculation using private metadata on order or checkout object. Example:
  {
  "key": "avataxShipFromAddress",
  "value": "{\"street\":\"123 Custom Street\",\"city\":\"Custom City\",\"state\":\"CA\",\"zip\":\"90210\",\"country\":\"US\"}"
  }
- 58fac0d5: Dropped support for Saleor 3.19

## 1.21.3

### Patch Changes

- 3f2e2f51: Changed some of Saleor webhook response statuses.

  Previously, app either returned 5xx (if we expect Saleor to retry) or 4xx (if we can't process, for various reasons, but we don't want a retry).

  Due to upcoming Saleor Circuit Breaker mechanism, we no longer can rely on 4xx status for every case. After this change, app will sometimes return status 202 in case of error.

  For example - when app is not configured, it's expected that 4xx is returned and Saleor will disable not configured app eventually. But in case of webhooks that are not processable _sometimes_,
  app will return ACCEPTED code and exit gracefully. This way, Saleor will not disable healthy webhooks, that can't be process under certain conditions

## 1.21.2

### Patch Changes

- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 1.21.1

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0

## 1.21.0

### Minor Changes

- b1c2ff47: ~~Adding support to overwrite the shipFrom address in the avatax calculation using private metadata on order or checkout object.~~ Change reverted

### Patch Changes

- 118190c3: Validating the tax calculation and making e2e tests work for the new shipFrom address feature

## 1.20.0

### Minor Changes

- 7e590663: Send Saleor order number instead of order id as AvaTax document code. Previously app was using first 20 characters of order id. This was causing a problem on AvaTax side as there weren't any way of connecting Saleor order (as order id was truncated to first 20 chars). After this change app will send order number (e.g 2137) instead. Thanks to that you will see it in AvaTax dashboard and you will be able to use this number for searching for order in Saleor.
- 3583edfc: Improve tax code search functionality in AvaTax matcher

  - Enhanced tax code combobox to display full format (`code - description`) for both selected values and initial values loaded from database
  - Updated tax code filtering to search both tax code and description fields instead of code only
  - Implemented client-side filtering for more flexible and responsive search experience
  - Fixed initial value formatting to show complete tax code information when data is available

  Users can now search for tax codes by typing either the tax code (e.g., "TX001") or the description (e.g., "Taxable").

### Patch Changes

- adb38165: Added InvalidZipForStateError to expected errors. It will no longer be treated as exception in logs and Sentry. This error is thrown when user enters incorrect Zip code for their state.
- 055aabc9: Changed tRPC logs to add `[TRPC Error]` prefix, to distinguish these errors from others. Changed tRPC error codes to better reflect HTTP status codes (e.g. unauthorized, instead of internal server error).
- b23b47ad: Allow AvaTax app name and app version to be dynamically set up via env variables.
- 0a1c07ef: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.
- af002a41: Update AvaTax UI. This includes: removing providers mentions where possible, changing form labels of AvaTax configuration, adding breadcrumbs to tax code matcher view.
- 4135836e: Replaced `TaxCodeSelect` with `TaxCodeCombobox` component for AvaTax tax code matcher section.

## 1.19.0

### Minor Changes

- 5e19ceff: App will now add Note to Order when a transaction is committed or cancelled in AvaTax. This leads to better visibility of the order, e.g., on the Dashboard page

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1

## 1.18.2

### Patch Changes

- c7f719c7: Handle AvaTaxGetTaxError for order confirmed. After this change such error will be considered handled (as this is connected to wrong input provided by user).

## 1.18.1

### Patch Changes

- 51b4d859: Installed DynamoDB APL (controlled via env variable).

## 1.18.0

### Minor Changes

- 04066f00: Added DynamoDB APL instantiation

## 1.17.3

### Patch Changes

- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 1.17.2

### Patch Changes

- fe605010: Update DynamoDB Toolbox to > v2, no function changes introduced
- 3f86ada8: Remove not needed error log from AvaTax client. After this change logs generated by the app should generate less noise.
  - @saleor/apps-logger@1.6.1

## 1.17.1

### Patch Changes

- Updated dependencies [00070dc3]
  - @saleor/apps-shared@1.13.0

## 1.17.0

### Minor Changes

- 0650e0d3: Added a new App Extension to Order Details page in the Dashboard (3.22 and above). It will show some of the AvaTax metadata if it was used to calculate taxes

### Patch Changes

- c490ca75: Fixed link to Saleor docs. After this change links should point to the newest version of docs without redirects.
- Updated dependencies [d3702072]
- Updated dependencies [c68f1e9f]
  - @saleor/apps-logger@1.6.0
  - @saleor/apps-otel@2.3.0

## 1.16.1

### Patch Changes

- 3259b3ca: Changed some logger "info" logs to "debug" to reduce the number of verbose logs

## 1.16.0

### Minor Changes

- e3c75265: Add custom OTEL metric that counts requests made to AvaTax API.

### Patch Changes

- 4c5c63d5: Use TypeScript unions instead of enums in types generated from Graphql files.
- b4ed42c9: Added wrapper for external OTEL tracer. Wrapper is responsible for enhanced error serialization, custom attribute injection & proper span lifecycle management.
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
  - @saleor/apps-otel@2.2.0
  - @saleor/apps-shared@1.12.3
  - @saleor/apps-logger@1.5.5

## 1.15.1

### Patch Changes

- 94c52129: Update to Next.js 15
- 6e268b36: Export tRPC handler once in app route.
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-ui@1.2.12
  - @saleor/webhook-utils@0.2.5

## 1.15.0

### Minor Changes

- 1aff5e42: Migrate AvaTax app to Next.js app router.

### Patch Changes

- Updated dependencies [1aff5e42]
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5

## 1.14.7

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`
- Updated dependencies [a76465fb]
  - @saleor/apps-logger@1.5.3
  - @saleor/apps-otel@2.1.4

## 1.14.6

### Patch Changes

- 339518c2: Fixed how we initialize Sentry SDK for API routes when runtime is Node.js. After this change we will use `NodeClient` directly from Sentry SDK to avoid interfering with our OTEL setup. We also removed not needed Sentry integration for edge runtime

## 1.14.5

### Patch Changes

- cc32891b: Fix how we initialize Sentry SDK for API routes when using node.js runtime. After this change we will use `NodeClient` from Sentry directly - avoiding Sentry interference with our OTEL setup.

## 1.14.4

### Patch Changes

- a18b637e: Setup Sentry integration with our OTEL setup.

## 1.14.3

### Patch Changes

- c8e61ac2: Updated Sentry to 9.6.1
- da9899d5: Cleanup deps, peerDeps & devDependencies for package
- Updated dependencies [da9899d5]
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/webhook-utils@0.2.5
  - @saleor/apps-logger@1.5.2
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-otel@2.1.3
  - @saleor/apps-ui@1.2.12
  - @saleor/sentry-utils@0.2.4

## 1.14.2

### Patch Changes

- Updated dependencies [6e94e99c]
  - @saleor/apps-otel@2.1.2

## 1.14.1

### Patch Changes

- f8196e1d: Fixed how we import logger transports. After this change logger can be used from scripts that use `tsx` package.
- 996d9be1: Use [PNPM catalogs](https://pnpm.io/catalogs) feature to ensure that dependencies are in sync between different packages in monorepo.
- aa1c7597: Added new attributes to OTEL setup - it will allow better GitHub integration with our OTEL provider
- Updated dependencies [996d9be1]
- Updated dependencies [aa1c7597]
  - @saleor/react-hook-form-macaw@0.2.13
  - @saleor/webhook-utils@0.2.4
  - @saleor/apps-logger@1.5.1
  - @saleor/apps-shared@1.12.1
  - @saleor/apps-otel@2.1.1
  - @saleor/apps-ui@1.2.11
  - @saleor/sentry-utils@0.2.4

## 1.14.0

### Minor Changes

- c51307e6: Refactor AvaTax client to use neverthrow library. No visible changes to the end user.
- 71360cb4: Wrapped AvaTax API calls and Saleor webhook handlers in tracking spans. Also improved client logs.

### Patch Changes

- 3a618b9f: Pass channelId instead of channelSlug to client logs & remove not used field from client logs
- 8154e9e9: Use `AwsInstrumentation` to auto instrument DynamoDB calls
- Updated dependencies [8154e9e9]
  - @saleor/apps-otel@2.1.0

## 1.13.0

### Minor Changes

- 3c4358ae: Setup OTEL via instrumentation hook. After this change app will use [official way](https://nextjs.org/docs/14/app/building-your-application/optimizing/open-telemetry) of setting up OTEL. There are no visible changes to the end user.

### Patch Changes

- defa0b60: Migrate API route handlers to `compose` function.
- defa0b60: Rename `wrapWithSpanAttributes` to `withSpanAttributes`. No changes to the end user.
- e3fe0f70: Use `@vercel/otel` package to setup OTEL. After this change spans will be automatically flushed by Vercel.
- Updated dependencies [3c4358ae]
- Updated dependencies [9cfb8ace]
- Updated dependencies [e3fe0f70]
- Updated dependencies [23a31eb4]
- Updated dependencies [defa0b60]
- Updated dependencies [defa0b60]
  - @saleor/apps-otel@2.0.0
  - @saleor/apps-logger@1.5.0
  - @saleor/apps-shared@1.12.0

## 1.12.10

### Patch Changes

- 708a0a8b: Fix time to live of client logs. After this change logs will be deleted after 14 days by default.

## 1.12.9

### Patch Changes

- b3e136b0: Add `saleor-app` prefix to `package.json` so names of npm app projects are in sync with names of Vercel projects. No visible changes to the user.

## 1.12.8

### Patch Changes

- 899a0576: Changed behavior how tax rate is calculated. It was possible that AvaTax return a non-zero rate, while the actual tax was 0 (for example - product is normally taxable, but this transaction has tax exemption).

  Previously, app returned original, non-zero tax rate as the response together with 0 tax.

  Now, if taxableAmount or total net amount is 0, rate will be also zero

## 1.12.7

### Patch Changes

- 2f06b1e9: Bumping app-sdk to v0.52.0 - adding native APL support for vercel-kv and redis
- 99f64efc: - Fixed bug in webhook migration script that was causing app webhooks to be disabled by migration
- a8f63fc4: Modified vercel.json to allow multiple regions. Now Vercel will replicate function in "dub1" and "iad1"

## 1.12.6

### Patch Changes

- 0f0bff21: Move `ThemeSynchronizer` utility to shared packages.
- 18a9c3d9: Implement client logs cache. Right now app will cache request for 1 day and revalidate the cache every 60 seconds.
  Added forward / backward pagination to client logs. After this change end user can browse logs that exceeds current pagination limit (first 100).
- e195c8d7: Remove feature flag for client logs. After this change logs are enabled by default.
- e3e0d6d2: Added test for suspicious line+tax calculation checker and additional debugging logs

## 1.12.5

### Patch Changes

- 0db174a8: Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.

## 1.12.4

### Patch Changes

- 9bbf9ee5: Increased Vercel log limit to new value - 256KB. See [announcement](https://vercel.com/changelog/updated-logging-limits-for-vercel-functions) blog post from Vercel for more details.
- 9bbf9ee5: Escape ALLOWED_DOMAIN_PATTERN regex. It ensures that regex constructed from env variable is sanitized and can't be used to Denial of Service attack.
- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.
- 9bbf9ee5: Add log when suspicious calculation happen - when line tax rate is non-zero but amount of taxes is zero
- Updated dependencies [9bbf9ee5]
- Updated dependencies [9bbf9ee5]
  - @saleor/apps-logger@1.4.3
  - @saleor/react-hook-form-macaw@0.2.12
  - @saleor/webhook-utils@0.2.3
  - @saleor/apps-shared@1.11.4
  - @saleor/apps-otel@1.3.5
  - @saleor/apps-ui@1.2.10

## 1.12.3

### Patch Changes

- 2b45d2be: Add log when suspicious calculation happen - when line tax rate is non-zero but amount of taxes is zero

## 1.12.2

### Patch Changes

- 83ad6531: Updated Node.js to 22.11
- Updated dependencies [1e70b997]
- Updated dependencies [83ad6531]
  - @saleor/apps-logger@1.4.2
  - @saleor/apps-otel@1.3.4
  - @saleor/react-hook-form-macaw@0.2.11
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.11.3
  - @saleor/apps-ui@1.2.9
  - @saleor/webhook-utils@0.2.2

## 1.12.1

### Patch Changes

- 69992d56: Remove not needed information from AvaTax app logs to make them more readable and to be below Vercel log drain limit.
- 69992d56: Update modern-errors-serialize library so it supports excluding error property from serialization
- Updated dependencies [69992d56]
  - @saleor/webhook-utils@0.2.1
  - @saleor/apps-logger@1.4.1

## 1.12.0

### Minor Changes

- 96c3164f: Added AvaTax `itemCode` support when handling order or checkout calculate taxes webhooks. After this change app will send `itemCode` to Avalara based on Saleor variant SKU or variant id.

### Patch Changes

- ed729b62: Run webhook migrations in parallel.
- Updated dependencies [92a2a5fd]
  - @saleor/apps-logger@1.4.0

## 1.11.0

### Minor Changes

- 7a1a74ba: Adds t3-env library for validating env variables.

### Patch Changes

- 5a6ea741: Added warning logs when Avalara returns `isFee` in product or shipping line details.
- 2f37f075: Improved error handling and reporting while migrating webhooks. After this change we skip logging to OTEL. Logs will be available on Vercel, when migration fail we will send error to Sentry.
- d088ef37: Use new way of creating logger from `@saleor/apps-logger`
- Updated dependencies [2f37f075]
- Updated dependencies [2f37f075]
- Updated dependencies [d088ef37]
- Updated dependencies [6d528dc6]
  - @saleor/apps-logger@1.3.0
  - @saleor/webhook-utils@0.2.0

## 1.10.9

### Patch Changes

- 790ec961: App will now use MANIFEST_APP_ID env variable to provide app ID in the manifest. This allows to set different ID in production, dev, staging envs allowing them to be installed at the same time

## 1.10.8

### Patch Changes

- ce15d82a: Experimentally move creating dependencies (checkout-calculate-taxes) into handler body. This is a hypothesis that lambda will start up faster.

## 1.10.7

### Patch Changes

- 6be0103c: Added new `LoggerVercelTransport` support. It will help us send logs to our infrastructure without need of OTEL unstable logs API.
- Updated dependencies [6be0103c]
  - @saleor/apps-logger@1.2.10

## 1.10.6

### Patch Changes

- 02a4e4ba: Increase memory in Avatax. Previous reduction caused a large cold start increase

## 1.10.5

### Patch Changes

- 2eac9634: Set max memory limits for Webhooks to be 256MB. Before that, it was a default 1769MB. In case of Vercel deployment this will reduce pricing via GB-hours 7 times

## 1.10.4

### Patch Changes

- f4250c1a: Fixed broken taxes resolving for billing address

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

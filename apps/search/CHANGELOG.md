# saleor-app-search

## 1.22.13

### Patch Changes

- Updated dependencies [f1025fae]
  - @saleor/apps-otel@1.3.3

## 1.22.12

### Patch Changes

- Updated dependencies [93969b2a]
  - @saleor/apps-otel@1.3.2

## 1.22.11

### Patch Changes

- fe5d5d5e: Updated @saleor/app-sdk to 0.50.3. This version removes the limitation of body size for the webhook payloads.

## 1.22.10

### Patch Changes

- f57cd9b9: Now flag the "bundlePagesExternals" is enabled. This means cold-run can be reduced accordingly to Vercel recommendation.
- 77329589: The initial import of product to algolia is no longer stuck while processing. This means the UI now informs you when the upload is finished.
- 2c185816: Active webhooks are no longer disabling themselves when running migrations. This means when some webhook is active, migration will turn on all of them.
- 45a47156: Updated @saleor/app-sdk to 0.50.2. No functional changes are introduced

## 1.22.9

### Patch Changes

- 3e139f2f: Search app now handles Algolia's 'record is too big' error. It means that the app now returns 400s instead of 500s.
- 6fed4b19: Migrate to new newest MacawUI version. Functionally nothing has changed. UI may look a bit different but it will be on par with Dashboard UI.
- Updated dependencies [6fed4b19]
  - @saleor/react-hook-form-macaw@0.2.10
  - @saleor/apps-shared@1.11.2
  - @saleor/apps-ui@1.2.8

## 1.22.8

### Patch Changes

- 9441359a: Search app now logs warnings when authData is missing. Logged errors in webhook handlers that had the same messages have been changed, meaning that debugging is now easier.

## 1.22.7

### Patch Changes

- 3be6fa18: The feature allowing app to disable its own webhooks was removed. Initially it was designed to update webhooks after the new version of the app (with new webhooks) was released.
  Now, app contains migration script that runs on the deployment and webhooks are automatically recreated, so the feature is no longer needed.

## 1.22.6

### Patch Changes

- e38c1417: You can now find how to run and test each app in README file

## 1.22.5

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.
- Updated dependencies [17077505]
  - @saleor/react-hook-form-macaw@0.2.9
  - @saleor/webhook-utils@0.1.4
  - @saleor/sentry-utils@0.2.3
  - @saleor/apps-logger@1.2.9
  - @saleor/apps-shared@1.11.1
  - @saleor/apps-otel@1.3.1
  - @saleor/apps-ui@1.2.7

## 1.22.4

### Patch Changes

- Updated dependencies [6f2d6abb]
  - @saleor/apps-otel@1.3.0

## 1.22.3

### Patch Changes

- fbdbaa28: Remove custom Next.js + Sentry error. It was causing non existing paths to be reported as 500 instead of 404. We catch Sentry errors in implicit anyway in api routes.
- Updated dependencies [fbdbaa28]
  - @saleor/sentry-utils@0.2.2

## 1.22.2

### Patch Changes

- 00cdf64b: Added packages optimization, via Next.js configuration. This should decrease cold starts due to smaller bundle size
- 2f59041c: Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately
- Updated dependencies [2f59041c]
  - @saleor/sentry-utils@0.2.1

## 1.22.1

### Patch Changes

- 0c4ba39f: Update next.js config after Sentry rollback.
- Updated dependencies [0c4ba39f]
- Updated dependencies [0c4ba39f]
- Updated dependencies [5c851a6c]
  - @saleor/apps-otel@1.2.2
  - @saleor/apps-logger@1.2.8

## 1.22.0

### Minor Changes

- c4dcb863: Remove Pino logger library. It was already deprecated but for non migrated apps it was causing build errors. Right now we have one logger - @saleor/app-logger pkg.
- 1a9912f5: Setup Sentry inside Next.js instrumentation file. It ensures that Sentry works properly for serverless environment.
- b9957b11: Removed the functionality that automatically disabled webhooks when Algolia responded with errors.
  This behavior was unstable, and we received reports that webhooks were being randomly disabled, even when the credentials were correct.

  To ensure apps operate reliably, webhooks are now managed as follows:

  - After installation, if the app is not configured, webhooks are disabled.
  - When the configuration is saved, the app validates Algolia credentials. Invalid credentials cannot be saved.
  - Once valid credentials are saved, webhooks are enabled.
  - Webhooks will remain enabled, even if tokens are rotated.

### Patch Changes

- b9957b11: Wrapped API routes with logger context utility. Now it will pass all attributes down to every log emitted during the request. It automatically adds attributes like saleorApiUrl or event to OTEL logs
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

## 1.21.7

### Patch Changes

- e8c9d7c7: Added bunch of logs at level INFO. Now app will log much more operations. Previously majority of logs were TRACE or DEBUG level

## 1.21.6

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

## 1.21.5

### Patch Changes

- 4ffef6be: Update `@sentry/nextjs` to 8.0.0 version. It should help us with attaching additional data to Sentry errors.
- 2792a025: Fixed problem when webhooks were disabled if _any_ error from Algolia was received. Now only 401 and 403 errors (invalid auth/credentials) will cause webhooks disabling, until app is configured again.
- 2792a025: Fixed logger execution to properly attach attributes
- 2604ce1e: Updated Next.js to 14.2.3
- Updated dependencies [4ffef6be]
- Updated dependencies [2604ce1e]
  - @saleor/apps-logger@1.2.5
  - @saleor/webhook-utils@0.1.1
  - @saleor/apps-shared@1.10.2
  - @saleor/apps-ui@1.2.4
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 1.21.4

### Patch Changes

- Updated dependencies [eec25524]
- Updated dependencies [827be8c8]
  - @saleor/apps-logger@1.2.4
  - @saleor/webhook-utils@0.1.0

## 1.21.3

### Patch Changes

- Updated dependencies [528b981e]
  - @saleor/apps-logger@1.2.3

## 1.21.2

### Patch Changes

- Updated dependencies [f22f2b8a]
- Updated dependencies [df03c571]
  - @saleor/apps-logger@1.2.2
  - @saleor/apps-shared@1.10.1
  - @saleor/webhook-utils@0.0.7

## 1.21.1

### Patch Changes

- Updated dependencies [0a441ac9]
- Updated dependencies [f7ecb7bd]
  - @saleor/apps-logger@1.2.1

## 1.21.0

### Minor Changes

- b29318a2: Currently, Dashboard requires from a user to have "MANAGE_APPS" to have access to the apps tab.
  Since the release 3.20 Dashboard will allow all users to access to apps tabs without checking permission.
  This means that apps will be checking if the user has "MANAGE_APPS" internally and show message "You do not have permission to access this page" if the user does not have the permission.

### Patch Changes

- Updated dependencies [b29318a2]
  - @saleor/apps-shared@1.10.0
  - @saleor/webhook-utils@0.0.6

## 1.20.4

### Patch Changes

- 29d10d4a: Update Next.js to version 14.1.0.
- 6bd6fa69: Fixed "boolean" attribute type mapping. Now it will look for raw boolean value (attribute.value.boolean) instead trying to stringify attribute name. The rest of attribute types were not touched.
- Updated dependencies [29d10d4a]
  - @saleor/apps-shared@1.9.4
  - @saleor/apps-ui@1.2.3
  - @saleor/apps-logger@1.2.0
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6
  - @saleor/webhook-utils@0.0.5

## 1.20.3

### Patch Changes

- Updated dependencies [1e07a6ff]
  - @saleor/apps-logger@1.2.0

## 1.20.2

### Patch Changes

- 67afe8e4: Apps that use OTEL can now collect and send spans containing details about GraphQL requests.
- Updated dependencies [67afe8e4]
- Updated dependencies [67afe8e4]
  - @saleor/apps-shared@1.9.3
  - @saleor/apps-otel@1.1.0
  - @saleor/webhook-utils@0.0.4

## 1.20.1

### Patch Changes

- Updated dependencies [2683431]
  - @saleor/apps-logger@1.1.1

## 1.20.0

### Minor Changes

- 93848f2: Added Open Telemetry setup, including tracing for api handlers and logger, connected to Sentry and Otel.

### Patch Changes

- Updated dependencies [93848f2]
- Updated dependencies [93848f2]
  - @saleor/apps-logger@1.1.0

## 1.19.3

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
  - @saleor/webhook-utils@0.0.3

## 1.19.0

### Minor Changes

- 563fca9: Added "sku" field to the object mapped to Algolia. If sku is defined in the product variant, it will be passed to the synchronized index.

## 1.18.0

### Minor Changes

- a50df02: Reduced Sentry traces sample rate to 0.1
- 9fc5b1a: Added new field to the index: productPricing that contains price range (start-stop). Now each variant can be displayed with pricing of cheapest and most expensive ones.

### Patch Changes

- f4c67e8: Updated TRPC version

## 1.17.2

### Patch Changes

- fdabc51: Mapped app-sdk package to root library
- Updated dependencies [fdabc51]
  - @saleor/webhook-utils@0.0.2
  - @saleor/apps-shared@1.9.1
  - @saleor/apps-ui@1.2.1

## 1.17.1

### Patch Changes

- 148a6d7: Updated Sentry to 7.77.0

## 1.17.0

### Minor Changes

- 556906a: Reduced memory limit for UPDATED\* webhooks to 256mb

## 1.16.0

### Minor Changes

- 1982d81: Added a new `pricing` field to the Algolia object representation. It now passes variant pricing representation from GraphQL:

  ```graphQL
      price {
        gross {
          amount
        }
        net {
          amount
        }
      }
      discount {
        gross {
          amount
        }
        net {
          amount
        }
      }
      onSale
      priceUndiscounted {
        gross {
          amount
        }
        net {
          amount
        }
      }
  ```

### Patch Changes

- 5d3d81d: Bumped @hookform/resolvers from 2.9.11 to 3.3.1
- 5dee65a: Updated dependencies:
  - @graphql-codegen/cli@5.0.0
- 2e29699: Updated Sentry package
- 7e0755e: Webhook migration scripts has been moved to the shared package.
- Updated dependencies [5dee65a]
- Updated dependencies [7e0755e]
  - @saleor/webhook-utils@0.0.1

## 1.15.0

### Minor Changes

- 1e3c08c: Added fields filtering form. Unused fields can be unchecked to match Algolia limits. By default every field is selected
- ed30a81: Added "Saleor Commerce" as an author in the Manifest

### Patch Changes

- e8660e8: Implemented shared getApBaseUrl
- e8660e8: Replaced GraphQL provider with shared package
- e8660e8: Replaced AppSections implementation with the shared package
- ed30a81: Refactor: Migrated private metadata of the app (used for settings) - previously each setting was saved in a dedicated metadata key. Now entire config is kept as JSON in a single field. This is non-breaking change - app will fallback to old config if needed.
- ed30a81: Refactor: Extracted shared webhook logic, like clients creation and settings fetching to a shared function that creates entire context. Webhook handlers LoC decreased by half
- e8660e8: Implemented ThemeSynchronizer from shared package
- e8660e8: Fixed broken configuration form when legacy metadata was fetched
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
  - @saleor/apps-shared@1.9.0
  - @saleor/apps-ui@1.2.0

## 1.14.0

### Minor Changes

- 2a1385b: Added new field to products document: descriptionPlaintext. It contains the product description converted to plaintext format which can be used to full text search.
- 2a1385b: Added Algolia index configuration helper, which sets up recommended settings: distinct results based on Product ID, faceting filters and searchable attributes.

### Patch Changes

- 2a1385b: Added script responsible for webhook migration.
- a81f061: Updated Macaw to pre-127
- 2a1385b: Fixed issue with stale product variants after product deletion or channel visibility settings change.
- fcc37e7: Remove clsx package from the projects no longer using it.
- 0f84985: Refactor: Introduced tRPC and re-implemented /api/configuration endpoint to the tRPC controller.

  _This does not affect the end-user functionality_

- Updated dependencies [2a1385b]
- Updated dependencies [a81f061]
- Updated dependencies [fcc37e7]
  - @saleor/apps-shared@1.8.1
  - @saleor/react-hook-form-macaw@0.2.5
  - @saleor/apps-ui@1.1.8

## 1.13.1

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118
- Updated dependencies [8b3d961]
- Updated dependencies [c50797e]
  - @saleor/react-hook-form-macaw@0.2.4
  - @saleor/apps-shared@1.8.0
  - @saleor/apps-ui@1.1.7

## 1.13.0

### Minor Changes

- 69fe973: Extended search model with two new fields:

  - `inStock`: returns true if stock is available. To keep this up to date, the application subscribes to `ProductVariantOutOfStock` and `ProductVariantBackInStock` events
  - `media`: array of objects containing URL and type of given file (video or image)

  To enable those features, open App configuration page and click on the `Update webhooks` button. To update existing data start a data import.

## 1.12.1

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged
- Updated dependencies [261957f]
  - @saleor/react-hook-form-macaw@0.2.3
  - @saleor/apps-shared@1.7.6
  - @saleor/apps-ui@1.1.6

## 1.12.0

### Minor Changes

- 2cb7e5e: Improved attributes mapping. Now Algolia will receive better products data:
  - Added `otherVariants` field which is _an array of variant id strings_. It will only contain other variants, so if the array is empty, it means the variant is the only one. It can be quickly used to count alternative variants or to reference them by ID.
  - Added `variantMetadata` field. Now `metadata` contains data for product parent and `variantMetadata` for each variant.
  - Improved JSON fields mapping. Now json-like fields will be sent to Algolia as structure jsons, not strings. This include: `description`, `metadata`, `variantMetadata`, `otherVariants`.

## 1.11.2

### Patch Changes

- 2fab86b: Updated graphql package to 16.7.1 and @graphql-codegen related dependencies to the latest version.
- aa6fec1: Updated Macaw UI to pre-106
- Updated dependencies [aa6fec1]
- Updated dependencies [aa6fec1]
  - @saleor/react-hook-form-macaw@0.2.2
  - @saleor/apps-shared@1.7.5
  - @saleor/apps-ui@1.1.5

## 1.11.1

### Patch Changes

- 70cb741: Update Zod to 3.21.4
- e7c2d3a: Updated and ESLint dependencies
- 3c6cd4c: Updated the @saleor/app-sdk package to version 0.41.1.
- 6210447: Updated @tanstack/react-query 4.29.19
- Updated dependencies [70cb741]
- Updated dependencies [e7c2d3a]
- Updated dependencies [3c6cd4c]
- Updated dependencies [6210447]
  - @saleor/react-hook-form-macaw@0.2.1
  - @saleor/apps-shared@1.7.4
  - @saleor/apps-ui@1.1.4

## 1.11.0

### Minor Changes

- a1f083c: Filled "about" field in App Manifest. Dashboard will display it in app details page now.
- 47102ba: Added additional ENV variables (see each app's .env.example), that can overwrite app base URL. This change allows easy apps development using Docker

### Patch Changes

- 2d77bca: Updated Next.js to 13.4.8
- 6299e06: Update @saleor/app-sdk to 0.41.0
- Updated dependencies [2d77bca]
- Updated dependencies [6299e06]
  - @saleor/apps-shared@1.7.3
  - @saleor/apps-ui@1.1.3
  - @saleor/react-hook-form-macaw@0.2.0

## 1.10.0

### Minor Changes

- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.

### Patch Changes

- 860bac4: Updated @saleor/app-sdk to 0.40.1
- a1ad70e: Updated configuration and dependencies of GraphQL client - urql.
  All applications use now unified config for creating the client. Also unused related packages has been removed.
- ec68ed5: Updated Sentry package and config. Set Sentry release to match package.json version. Now Sentry will use semver version instead a commit
- cb6ee29: Updated dependencies
- cce3c1e: Regression - Fixed Algolia "index prefix" field to be optional, just like it was before the refcator.
- Updated dependencies [f96563f]
- Updated dependencies [f96563f]
- Updated dependencies [860bac4]
- Updated dependencies [a1ad70e]
- Updated dependencies [cb6ee29]
- Updated dependencies [a1ad70e]
  - @saleor/react-hook-form-macaw@0.2.0
  - @saleor/apps-ui@1.1.2
  - @saleor/apps-shared@1.7.2

## 1.9.4

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo
- 928c727: Updated @saleor/macaw-ui to 0.8.0-pre.95. This version introduces change in spacing scale, so there may be slight changes in spacing
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [928c727]
  - @saleor/react-hook-form-macaw@0.1.2
  - @saleor/apps-shared@1.7.1
  - @saleor/apps-ui@1.1.1

## 1.9.3

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/react-hook-form-macaw@0.1.1
  - @saleor/apps-shared@1.7.0

## 1.9.2

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.9.1

### Patch Changes

- 590150b: Use input component from the shared package.
- Updated dependencies [23b5c70]
- Updated dependencies [8a339fc]
- Updated dependencies [b36502d]
  - @saleor/apps-shared@1.6.0
  - @saleor/react-hook-form-macaw@0.1.0

## 1.9.0

### Minor Changes

- 24615cf: Replaced custom Chip implementation with SemanticChip from shared package
- e751459: Use TextLink component from shared package

### Patch Changes

- f9ca488: Fixed how TextLink is displayed - added missing space between spans
- c406318: Updated dep @saleor/app-sdk to 0.38.0
- 403bcf8: Update @saleor/app-sdk to 0.8.0-pre.84
- Updated dependencies [24615cf]
- Updated dependencies [ba7c3de]
- Updated dependencies [c406318]
- Updated dependencies [e751459]
- Updated dependencies [f9ca488]
  - @saleor/apps-ui@1.1.0
  - @saleor/apps-shared@1.5.1

## 1.8.1

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 1.8.0

### Minor Changes

- 40bed99: Added webhooks optimization feature. App will validate Algolia config in several places:

  1. During config form submit
  2. During loading frontend
  3. During webhooks invocation

  If Algolia "ping" fails with 403, app will disable webhooks, assuming its misconfigured.

  Webhooks status is displayed in App configuration screen. If they are disabled, user can preview failed webhooks deliveries

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

- 830cfe9: Replaced internal logger implementation with shared logger
- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

## 1.7.1

### Patch Changes

- b33da7a: Improved helping description - added supported events and links to docs

## 1.7.0

### Minor Changes

- fc7a70f: Redesigned app to Macaw 2.0. Removed legacy code and unused libraries. Introduced Pino logger and Vitest. Bumped Macaw to 0.8.0 pre-release

## 1.6.0

### Minor Changes

- 57f6d41: Updated Manifest to contain up to date support, privacy, homepage and author fields

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

## 1.5.0

### Minor Changes

- eca52ad: Removed search index preview page. It can be easily accessed at Algolia itself.

### Patch Changes

- eca52ad: Update Next and Sentry
- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 1.4.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 1.3.3

### Patch Changes

- e93a4dc: Updated GraphQL Code Generator package

## 1.3.2

### Patch Changes

- dca82bb: Update app-sdk to pre-0.34.0. Update Async Webhooks to use new API

## 1.3.1

### Patch Changes

- 2755ed2: Added extra padding on top of the app so it has some space between content and dashboard header

## 1.3.0

### Minor Changes

- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

### Patch Changes

- Updated dependencies [2d23480]
  - @saleor/apps-shared@1.3.0

## 1.2.0

### Minor Changes

- 289b42f: Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own.
  Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md

## 1.1.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable
- 5fc88ed: Add shared theme provider with color overrides and globals
- ea850d3: Remove unused preview features and make CSS better

### Patch Changes

- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

## 1.0.3

### Patch Changes

- b874d10: Update @saleor/app-sdk to 0.29.0
- c786483: Subscription queries for webhooks has been splitted to pass a new validation
- Updated dependencies [648d99b]
  - @saleor/apps-shared@1.1.1

## 1.0.2

### Patch Changes

- ce17e45: Fix missing attribute values in products

## 1.0.1

### Patch Changes

- 9f843b2: Update imports to @saleor/apps-shared
- 9f843b2: Use TitleBar and AppIcon from shared package
- 9f843b2: Remove generated folders form git history
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
  - @saleor/apps-shared@1.1.0

## 1.0.0

### Major Changes

- 21f0a60: Include Search app to apps

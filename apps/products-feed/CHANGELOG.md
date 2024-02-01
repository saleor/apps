# saleor-app-products-feed

## 1.15.0

### Minor Changes

- 4ef6539: You can now map GTIN attribute from Saleor to your Google Feed.

## 1.14.2

### Patch Changes

- 5f564a0: Updated @saleor/app-sdk to 0.47.2

## 1.14.1

### Patch Changes

- 531e7c1: Disabled Sentry tracing and Replays by default

## 1.14.0

### Minor Changes

- 5eb17b2: Added "weight" attribute to the Google product feed.

  The attribute is added to the item entry when weight is defined and product is marked as requiring a shipping.

### Patch Changes

- 99f7066: Updated Macaw UI to 1.0.0-pre.7. Removed legacy Material UI dependency from older Macaw. Code was updated to work properly with some API changes
- Updated dependencies [99f7066]
  - @saleor/react-hook-form-macaw@0.2.6
  - @saleor/apps-shared@1.9.2
  - @saleor/apps-ui@1.2.2
  - @saleor/webhook-utils@0.0.3

## 1.13.0

### Minor Changes

- a50df02: Reduced Sentry traces sample rate to 0.1

### Patch Changes

- f4c67e8: Updated TRPC version

## 1.12.5

### Patch Changes

- fdabc51: Mapped app-sdk package to root library
- Updated dependencies [fdabc51]
  - @saleor/webhook-utils@0.0.2
  - @saleor/apps-shared@1.9.1
  - @saleor/apps-ui@1.2.1

## 1.12.4

### Patch Changes

- 148a6d7: Updated Sentry to 7.77.0

## 1.12.3

### Patch Changes

- c66e70c: Fixed lambda execution time on Vercel deployments with `vercel.json` file.

## 1.12.2

### Patch Changes

- ae6dbb1: Removed webhooks on product changes used for feed cache due to changed max execution time.
- ae6dbb1: Changed Vercel's maximum execution time to be 5 minutes for feed generation. This should help with the previous limits of 60s, that was not enough for feed to be generated.

## 1.12.1

### Patch Changes

- 5d3d81d: Bumped @hookform/resolvers from 2.9.11 to 3.3.1
- 5dee65a: Updated dependencies:
  - @graphql-codegen/cli@5.0.0
- 2e29699: Updated Sentry package

## 1.12.0

### Minor Changes

- 261e9d1: Added additional images attribute to the feed for media uploaded to the product.

### Patch Changes

- 23e71bc: Fix typo on button label
- 261e9d1: Improved default resolution of the submitted images. Was: 500px, now it's 1024px.
  Users can now configure the size in the app configuration.
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
  - @saleor/apps-shared@1.9.0
  - @saleor/apps-ui@1.2.0

## 1.11.4

### Patch Changes

- 2a1385b: Plaintext EditorJS renderer has been moved to the shared package.
- a81f061: Updated Macaw to pre-127
- fcc37e7: Remove clsx package from the projects no longer using it.
- Updated dependencies [2a1385b]
- Updated dependencies [a81f061]
- Updated dependencies [fcc37e7]
  - @saleor/apps-shared@1.8.1
  - @saleor/react-hook-form-macaw@0.2.5
  - @saleor/apps-ui@1.1.8

## 1.11.3

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118
- Updated dependencies [8b3d961]
- Updated dependencies [c50797e]
  - @saleor/react-hook-form-macaw@0.2.4
  - @saleor/apps-shared@1.8.0
  - @saleor/apps-ui@1.1.7

## 1.11.2

### Patch Changes

- 3002354: Added error logging for exceptions thrown at tRPC routes.

## 1.11.1

### Patch Changes

- bb504d9: Fixed error on loading configuration created in the previous version of the app.
- bb504d9: Fixed issue with saving changes in the title template form.
- bb504d9: Improved error logging in the tRPC API.

## 1.11.0

### Minor Changes

- 6a84b4b: Changed format of product URLs to Handlebars. Previous format can still be parsed, so this change does not affect existing configurations.

  Old format: `http://example.com/{variantId}`
  New format: `http://example.com/{{variant.id}}`

- 6a84b4b: Added item title customization using Handlebars.
- fc5e639: Feed format has been changed to leverage Product Group ID field:
  - Product ID: feed items use SKU if available, product variant ID is used otherwise
  - Product Group ID: product ID is used for all the items
- 0b0297e: Updated pricing attributes according to the Google guidelines.

  Was:

  - Price: base or discounted price

  Now:

  - Price: always the base price. Attribute skipped if amount is equal to 0.
  - Sale price: discounted price. Attribute skipped if value is the same as base price

- aece073: Added configuration for choosing which product attributes should be used for generating Google Product Feed. Supported feed attributes: Brand, Color, Size, Material, Pattern.

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged
- Updated dependencies [261957f]
  - @saleor/react-hook-form-macaw@0.2.3
  - @saleor/apps-shared@1.7.6
  - @saleor/apps-ui@1.1.6

## 1.10.3

### Patch Changes

- 07999ea: Changed input type for region in the AWS credentials section. Region can be now selected from the list, instead of text input.
- 43d7e47: Added validation for AWS credentials. If provided configuration for S3 Bucket is invalid, it won't be saved.

## 1.10.2

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

- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.
- 3462cc3: Improved helper text in S3 form - region field. Now it should be more explicit that only region code (like "eu-west-1") should be provided.
- e4497b9: Added test-id attributes to several meaningful elements. Now quering in automated tests are more stable
- e4497b9: Make Google Categories mapping lazy loaded, so the page loads immediately and forms add with a delay. Previously the page was stuck due to large chunk size

### Patch Changes

- 860bac4: Updated @saleor/app-sdk to 0.40.1
- a1ad70e: Updated configuration and dependencies of GraphQL client - urql.
  All applications use now unified config for creating the client. Also unused related packages has been removed.
- ec68ed5: Updated Sentry package and config. Set Sentry release to match package.json version. Now Sentry will use semver version instead a commit
- cb6ee29: Updated dependencies
- Updated dependencies [f96563f]
- Updated dependencies [f96563f]
- Updated dependencies [860bac4]
- Updated dependencies [a1ad70e]
- Updated dependencies [cb6ee29]
- Updated dependencies [a1ad70e]
  - @saleor/react-hook-form-macaw@0.2.0
  - @saleor/apps-ui@1.1.2
  - @saleor/apps-shared@1.7.2

## 1.8.1

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

## 1.8.0

### Minor Changes

- 182bdd6: This version introduces major update of the App UI:

  - Added Macaw UI / next
  - Rebuilt app's UI to match modern Saleor guidelines
  - Moved S3 form to be configured once, globally
  - Added tests and refactored App configuration/metadata (incompatible with previous version)
  - Product-related webhooks are now refreshing cache responsible on indexing large databases

  App was not officially released yet, hence only minor update is introduced

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/react-hook-form-macaw@0.1.1
  - @saleor/apps-shared@1.7.0

## 1.7.1

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.7.0

### Minor Changes

- 0c8717a: Generated feed XML can now be uploaded to the s3 bucket.

  Feed generation is now much faster thanks to implemented caching.

- 4801803: Added Sentry config. If Sentry is configured in ENV, it will use default Sentry configuration for Next.js to send errors to the Sentry

### Patch Changes

- ce8d9de: Product description in the feed is now a plaintext instead of JSON.
- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 1.6.2

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- 2de2a40: Query for the product details run now in paralell to speed up overall feed generation
- Updated dependencies [c406318]
  - @saleor/apps-shared@1.5.1

## 1.6.1

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 1.6.0

### Minor Changes

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

- 830cfe9: Replaced internal logger implementation with shared logger
- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

## 1.5.0

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

## 1.4.3

### Patch Changes

- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 1.4.2

### Patch Changes

- a811d30: Added default cache of feed file to 5 minutes. It can be overwritten by env variable.

## 1.4.1

### Patch Changes

- 5fad97c: Update the UI to the common theme
- f58043f: Add Google Products Category mapping

## 1.4.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 1.3.2

### Patch Changes

- e93a4dc: Updated GraphQL Code Generator package

## 1.3.1

### Patch Changes

- dca82bb: Update app-sdk to pre-0.34.0. Update Async Webhooks to use new API

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

### Patch Changes

- 4e4257d: Ensure initially selected channel will not crash if no channels exist

## 1.1.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable

### Patch Changes

- ca3a030: Add products feed app
- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

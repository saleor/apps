# saleor-app-products-feed

## 2.1.9

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 2.1.8

### Patch Changes

- 2a4f27ad: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 2.1.7

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 2.1.6

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3

## 2.1.5

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

## 2.1.4

### Patch Changes

- 08530771: Changed error handling. Now if internal operations in feed generation logic fails (throws error), feed generation will be interrupted and error returned. This should allow Google Merchant Center to retry operation, instead of consuming malformed XML.

## 2.1.3

### Patch Changes

- bb71489c: Allow app to execute Saleor calls in batches, that are configured as env variable (MAX_PARALLEL_CALLS). Default 5.

## 2.1.2

### Patch Changes

- 025e9ae2: Changed app to fetch chunks of products sequential instead of parallel to avoid abusing the API

## 2.1.1

### Patch Changes

- ff48a9e4: Add info about Saleor API url & channel to all logs. This will help us with debugging.

## 2.1.0

### Minor Changes

- 16c6448f: After this change required Saleor version for running the app will be **3.21**

### Patch Changes

- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 2.0.5

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0

## 2.0.4

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- 980e52c4: Fixed logger context for generate-chunk path. Now logs from this path will have valid attributes
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1

## 2.0.3

### Patch Changes

- 51b4d859: Installed DynamoDB APL (controlled via env variable).

## 2.0.2

### Patch Changes

- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 2.0.1

### Patch Changes

- @saleor/apps-logger@1.6.1

## 2.0.0

### Major Changes

- 57fa563e: Added possibility to scan entire Saleor catalog, without limits. Removed possibility to use the app without configured S3 bucket "in memory"

### Patch Changes

- Updated dependencies [00070dc3]
  - @saleor/apps-shared@1.13.0

## 1.23.1

### Patch Changes

- 608b05f3: Fix logging when app is calling Google. After this change channelSlug and saleorApiUrl should be visible inside logs.
- Updated dependencies [d3702072]
- Updated dependencies [c68f1e9f]
  - @saleor/apps-logger@1.6.0
  - @saleor/apps-otel@2.3.0

## 1.23.0

### Minor Changes

- cd397beb: Added support for [Handlebars Helpers](https://github.com/helpers/handlebars-helpers) which adds more flexibility to the template syntax.

## 1.22.9

### Patch Changes

- e3c75265: Add new `ATTR_SERVICE_INSTANCE_ID` OTEL attribute to app instrumentation.
- 4c5c63d5: Use TypeScript unions instead of enums in types generated from Graphql files.
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
  - @saleor/apps-otel@2.2.0
  - @saleor/apps-shared@1.12.3
  - @saleor/apps-logger@1.5.5

## 1.22.8

### Patch Changes

- 94c52129: Update to Next.js 15
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-ui@1.2.12
  - @saleor/webhook-utils@0.2.5

## 1.22.7

### Patch Changes

- Updated dependencies [1aff5e42]
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5

## 1.22.6

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`
- Updated dependencies [a76465fb]
  - @saleor/apps-logger@1.5.3
  - @saleor/apps-otel@2.1.4

## 1.22.5

### Patch Changes

- 339518c2: Fixed how we initialize Sentry SDK for API routes when runtime is Node.js. After this change we will use `NodeClient` directly from Sentry SDK to avoid interfering with our OTEL setup. We also removed not needed Sentry integration for edge runtime

## 1.22.4

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

## 1.22.3

### Patch Changes

- Updated dependencies [6e94e99c]
  - @saleor/apps-otel@2.1.2

## 1.22.2

### Patch Changes

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

## 1.22.1

### Patch Changes

- Updated dependencies [8154e9e9]
  - @saleor/apps-otel@2.1.0

## 1.22.0

### Minor Changes

- 3c4358ae: Setup OTEL via instrumentation hook. After this change app will use [official way](https://nextjs.org/docs/14/app/building-your-application/optimizing/open-telemetry) of setting up OTEL. There are no visible changes to the end user.

### Patch Changes

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

## 1.21.1

### Patch Changes

- b3e136b0: Add `saleor-app` prefix to `package.json` so names of npm app projects are in sync with names of Vercel projects. No visible changes to the user.

## 1.21.0

### Minor Changes

- 6c4e3302: Adding support for shipping_label in the attributes mapping.

### Patch Changes

- 2f06b1e9: Bumping app-sdk to v0.52.0 - adding native APL support for vercel-kv and redis
- a8f63fc4: Modified vercel.json to allow multiple regions. Now Vercel will replicate function in "dub1" and "iad1"

## 1.20.1

### Patch Changes

- 0f0bff21: Move `ThemeSynchronizer` utility to shared packages.

## 1.20.0

### Minor Changes

- e86926f2: Product feed: prioritize media assigned to a specific product variant. with a fallback mechanism to use product media when no variant-specific media is available. The changes aim to enhance the precision of media selection

## 1.19.18

### Patch Changes

- 0db174a8: Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.

## 1.19.17

### Patch Changes

- 9bbf9ee5: Increased Vercel log limit to new value - 256KB. See [announcement](https://vercel.com/changelog/updated-logging-limits-for-vercel-functions) blog post from Vercel for more details.
- 9bbf9ee5: Added new `LoggerVercelTransport` support. It will help us send logs to our infrastructure without need of OTEL unstable logs API.
- 9bbf9ee5: Escape ALLOWED_DOMAIN_PATTERN regex. It ensures that regex constructed from env variable is sanitized and can't be used to Denial of Service attack.
- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.
- Updated dependencies [9bbf9ee5]
- Updated dependencies [9bbf9ee5]
  - @saleor/apps-logger@1.4.3
  - @saleor/react-hook-form-macaw@0.2.12
  - @saleor/webhook-utils@0.2.3
  - @saleor/apps-shared@1.11.4
  - @saleor/apps-otel@1.3.5
  - @saleor/apps-ui@1.2.10

## 1.19.16

### Patch Changes

- 0fac242d: Now the total amount of loaded attributes and the size of generated XML is present within the logs.

## 1.19.15

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

## 1.19.14

### Patch Changes

- Updated dependencies [69992d56]
  - @saleor/webhook-utils@0.2.1
  - @saleor/apps-logger@1.4.1

## 1.19.13

### Patch Changes

- Updated dependencies [92a2a5fd]
  - @saleor/apps-logger@1.4.0

## 1.19.12

### Patch Changes

- d088ef37: Use new way of creating logger from `@saleor/apps-logger`
- Updated dependencies [2f37f075]
- Updated dependencies [2f37f075]
- Updated dependencies [d088ef37]
- Updated dependencies [6d528dc6]
  - @saleor/apps-logger@1.3.0
  - @saleor/webhook-utils@0.2.0

## 1.19.11

### Patch Changes

- 945a27be: Now, a single query for fetching variants was splitted into smaller ones to decrease the API overload.

## 1.19.10

### Patch Changes

- Updated dependencies [6be0103c]
  - @saleor/apps-logger@1.2.10

## 1.19.9

### Patch Changes

- Updated dependencies [f1025fae]
  - @saleor/apps-otel@1.3.3

## 1.19.8

### Patch Changes

- Updated dependencies [93969b2a]
  - @saleor/apps-otel@1.3.2

## 1.19.7

### Patch Changes

- fe5d5d5e: Updated @saleor/app-sdk to 0.50.3. This version removes the limitation of body size for the webhook payloads.

## 1.19.6

### Patch Changes

- 2bc8c187: Now, the flag "bundlePagesExternals" is enabled, this means the cold-starts time were reduced for this app.

## 1.19.5

### Patch Changes

- 45a47156: Updated @saleor/app-sdk to 0.50.2. No functional changes are introduced

## 1.19.4

### Patch Changes

- 6fed4b19: Migrate to new newest MacawUI version. Functionally nothing has changed. UI may look a bit different but it will be on par with Dashboard UI.
- Updated dependencies [6fed4b19]
  - @saleor/react-hook-form-macaw@0.2.10
  - @saleor/apps-shared@1.11.2
  - @saleor/apps-ui@1.2.8

## 1.19.3

### Patch Changes

- 93f96793: Entries within the xml file are no longer duplicated.
- d3d4d155: Now you can see in logs if someone is exceeding variant fetching limits.

## 1.19.2

### Patch Changes

- e38c1417: You can now find how to run and test each app in README file

## 1.19.1

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

## 1.19.0

### Minor Changes

- 19f288a4: You can now see more context information in logs that should be helpful in debugging issues with the app.

### Patch Changes

- Updated dependencies [6f2d6abb]
  - @saleor/apps-otel@1.3.0

## 1.18.3

### Patch Changes

- fbdbaa28: Remove custom Next.js + Sentry error. It was causing non existing paths to be reported as 500 instead of 404. We catch Sentry errors in implicit anyway in api routes.
- Updated dependencies [fbdbaa28]
  - @saleor/sentry-utils@0.2.2

## 1.18.2

### Patch Changes

- 2f59041c: Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately
- Updated dependencies [2f59041c]
  - @saleor/sentry-utils@0.2.1

## 1.18.1

### Patch Changes

- 0c4ba39f: Update next.js config after Sentry rollback.
- Updated dependencies [0c4ba39f]
- Updated dependencies [0c4ba39f]
- Updated dependencies [5c851a6c]
  - @saleor/apps-otel@1.2.2
  - @saleor/apps-logger@1.2.8

## 1.18.0

### Minor Changes

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

## 1.17.7

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

## 1.17.6

### Patch Changes

- 3eaa4521: Respect the cursor for the first page

## 1.17.5

### Patch Changes

- 4ffef6be: Update `@sentry/nextjs` to 8.0.0 version. It should help us with attaching additional data to Sentry errors.
- 2604ce1e: Updated Next.js to 14.2.3
- Updated dependencies [4ffef6be]
- Updated dependencies [2604ce1e]
  - @saleor/apps-logger@1.2.5
  - @saleor/webhook-utils@0.1.1
  - @saleor/apps-shared@1.10.2
  - @saleor/apps-ui@1.2.4
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 1.17.4

### Patch Changes

- Updated dependencies [eec25524]
- Updated dependencies [827be8c8]
  - @saleor/apps-logger@1.2.4
  - @saleor/webhook-utils@0.1.0

## 1.17.3

### Patch Changes

- Updated dependencies [528b981e]
  - @saleor/apps-logger@1.2.3

## 1.17.2

### Patch Changes

- Updated dependencies [f22f2b8a]
- Updated dependencies [df03c571]
  - @saleor/apps-logger@1.2.2
  - @saleor/apps-shared@1.10.1
  - @saleor/webhook-utils@0.0.7

## 1.17.1

### Patch Changes

- f7ecb7bd: Logger context can now pass path and project_name to help with debugging
- Updated dependencies [0a441ac9]
- Updated dependencies [f7ecb7bd]
  - @saleor/apps-logger@1.2.1

## 1.17.0

### Minor Changes

- b29318a2: Currently, Dashboard requires from a user to have "MANAGE_APPS" to have access to the apps tab.
  Since the release 3.20 Dashboard will allow all users to access to apps tabs without checking permission.
  This means that apps will be checking if the user has "MANAGE_APPS" internally and show message "You do not have permission to access this page" if the user does not have the permission.

### Patch Changes

- Updated dependencies [b29318a2]
  - @saleor/apps-shared@1.10.0
  - @saleor/webhook-utils@0.0.6

## 1.16.1

### Patch Changes

- 29d10d4a: Update Next.js to version 14.1.0.
- Updated dependencies [29d10d4a]
  - @saleor/apps-shared@1.9.4
  - @saleor/apps-ui@1.2.3
  - @saleor/apps-logger@1.2.0
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6
  - @saleor/webhook-utils@0.0.5

## 1.16.0

### Minor Changes

- 6b974f54: Add open-telemetry to products-feed application

## 1.15.1

### Patch Changes

- Updated dependencies [67afe8e4]
  - @saleor/apps-shared@1.9.3
  - @saleor/webhook-utils@0.0.4

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
  Read more about APLs: https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl

### Patch Changes

- 4e4257d: Ensure initially selected channel will not crash if no channels exist

## 1.1.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable

### Patch Changes

- ca3a030: Add products feed app
- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

# saleor-app-cms

## 2.13.5

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 2.13.4

### Patch Changes

- 2a4f27ad: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 2.13.3

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 2.13.2

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3

## 2.13.1

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

## 2.13.0

### Minor Changes

- 16c6448f: After this change required Saleor version for running the app will be **3.20**

### Patch Changes

- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 2.12.6

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0

## 2.12.5

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1

## 2.12.4

### Patch Changes

- 51b4d859: Installed DynamoDB APL (controlled via env variable).

## 2.12.3

### Patch Changes

- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 2.12.2

### Patch Changes

- @saleor/apps-logger@1.6.1

## 2.12.1

### Patch Changes

- Updated dependencies [00070dc3]
  - @saleor/apps-shared@1.13.0

## 2.12.0

### Minor Changes

- fe9c5cd0: Added bulk processing of uploading products to Strapi CMS. After this change you can use `STRAPI_BATCH_SIZE` to control number to request send in the same batch to Strapi API with `STRAPI_MILIS_DELAY_BETWEEN_BATCHES` controlling how frequent those batches are send to Strapi API.

### Patch Changes

- c490ca75: Fixed link to Saleor docs. After this change links should point to the newest version of docs without redirects.
- Updated dependencies [d3702072]
- Updated dependencies [c68f1e9f]
  - @saleor/apps-logger@1.6.0
  - @saleor/apps-otel@2.3.0

## 2.11.9

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

## 2.11.8

### Patch Changes

- 94c52129: Update to Next.js 15
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-ui@1.2.12

## 2.11.7

### Patch Changes

- Updated dependencies [1aff5e42]
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5

## 2.11.6

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`
- Updated dependencies [a76465fb]
  - @saleor/apps-logger@1.5.3
  - @saleor/apps-otel@2.1.4

## 2.11.5

### Patch Changes

- 339518c2: Fixed how we initialize Sentry SDK for API routes when runtime is Node.js. After this change we will use `NodeClient` directly from Sentry SDK to avoid interfering with our OTEL setup. We also removed not needed Sentry integration for edge runtime

## 2.11.4

### Patch Changes

- c8e61ac2: Updated Sentry to 9.6.1
- da9899d5: Cleanup deps, peerDeps & devDependencies for package
- Updated dependencies [da9899d5]
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/apps-logger@1.5.2
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-otel@2.1.3
  - @saleor/apps-ui@1.2.12
  - @saleor/sentry-utils@0.2.4

## 2.11.3

### Patch Changes

- Updated dependencies [6e94e99c]
  - @saleor/apps-otel@2.1.2

## 2.11.2

### Patch Changes

- 996d9be1: Use [PNPM catalogs](https://pnpm.io/catalogs) feature to ensure that dependencies are in sync between different packages in monorepo.
- aa1c7597: Added new attributes to OTEL setup - it will allow better GitHub integration with our OTEL provider
- Updated dependencies [996d9be1]
- Updated dependencies [aa1c7597]
  - @saleor/react-hook-form-macaw@0.2.13
  - @saleor/apps-logger@1.5.1
  - @saleor/apps-shared@1.12.1
  - @saleor/apps-otel@2.1.1
  - @saleor/apps-ui@1.2.11
  - @saleor/sentry-utils@0.2.4

## 2.11.1

### Patch Changes

- Updated dependencies [8154e9e9]
  - @saleor/apps-otel@2.1.0

## 2.11.0

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

## 2.10.1

### Patch Changes

- b3e136b0: Add `saleor-app` prefix to `package.json` so names of npm app projects are in sync with names of Vercel projects. No visible changes to the user.

## 2.10.0

### Minor Changes

- 34da7f12: Adding the SKU as synced field to the CMS app

### Patch Changes

- 2f06b1e9: Bumping app-sdk to v0.52.0 - adding native APL support for vercel-kv and redis
- a8f63fc4: Modified vercel.json to allow multiple regions. Now Vercel will replicate function in "dub1" and "iad1"

## 2.9.19

### Patch Changes

- 0f0bff21: Move `ThemeSynchronizer` utility to shared packages.

## 2.9.18

### Patch Changes

- 0db174a8: Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.

## 2.9.17

### Patch Changes

- 9bbf9ee5: Increased Vercel log limit to new value - 256KB. See [announcement](https://vercel.com/changelog/updated-logging-limits-for-vercel-functions) blog post from Vercel for more details.
- 9bbf9ee5: Added new `LoggerVercelTransport` support. It will help us send logs to our infrastructure without need of OTEL unstable logs API.
- 9bbf9ee5: Escape ALLOWED_DOMAIN_PATTERN regex. It ensures that regex constructed from env variable is sanitized and can't be used to Denial of Service attack.
- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.
- Updated dependencies [9bbf9ee5]
- Updated dependencies [9bbf9ee5]
  - @saleor/apps-logger@1.4.3
  - @saleor/react-hook-form-macaw@0.2.12
  - @saleor/apps-shared@1.11.4
  - @saleor/apps-otel@1.3.5
  - @saleor/apps-ui@1.2.10

## 2.9.16

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

## 2.9.15

### Patch Changes

- Updated dependencies [69992d56]
  - @saleor/apps-logger@1.4.1

## 2.9.14

### Patch Changes

- Updated dependencies [92a2a5fd]
  - @saleor/apps-logger@1.4.0

## 2.9.13

### Patch Changes

- d088ef37: Use new way of creating logger from `@saleor/apps-logger`
- Updated dependencies [2f37f075]
- Updated dependencies [d088ef37]
- Updated dependencies [6d528dc6]
  - @saleor/apps-logger@1.3.0

## 2.9.12

### Patch Changes

- Updated dependencies [6be0103c]
  - @saleor/apps-logger@1.2.10

## 2.9.11

### Patch Changes

- Updated dependencies [f1025fae]
  - @saleor/apps-otel@1.3.3

## 2.9.10

### Patch Changes

- Updated dependencies [93969b2a]
  - @saleor/apps-otel@1.3.2

## 2.9.9

### Patch Changes

- fe5d5d5e: Updated @saleor/app-sdk to 0.50.3. This version removes the limitation of body size for the webhook payloads.

## 2.9.8

### Patch Changes

- 2bc8c187: Now, the flag "bundlePagesExternals" is enabled, this means the cold-starts time were reduced for this app.

## 2.9.7

### Patch Changes

- 45a47156: Updated @saleor/app-sdk to 0.50.2. No functional changes are introduced

## 2.9.6

### Patch Changes

- 6fed4b19: Migrate to new newest MacawUI version. Functionally nothing has changed. UI may look a bit different but it will be on par with Dashboard UI.
- Updated dependencies [6fed4b19]
  - @saleor/react-hook-form-macaw@0.2.10
  - @saleor/apps-shared@1.11.2
  - @saleor/apps-ui@1.2.8

## 2.9.5

### Patch Changes

- b8400088: You can now distinguish which environment is alias in environment select.
  Environments select no longer show first option when you edit your config, now shows option that was selected

## 2.9.4

### Patch Changes

- e38c1417: You can now find how to run and test each app in README file

## 2.9.3

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.
- Updated dependencies [17077505]
  - @saleor/react-hook-form-macaw@0.2.9
  - @saleor/sentry-utils@0.2.3
  - @saleor/apps-logger@1.2.9
  - @saleor/apps-shared@1.11.1
  - @saleor/apps-otel@1.3.1
  - @saleor/apps-ui@1.2.7

## 2.9.2

### Patch Changes

- 52332d71: You can now see additional logs when webhook processing is skip because of lack of connection or processor

## 2.9.1

### Patch Changes

- ab5baf4e: You can now see when webhook processing is skip due to no having related channels

## 2.9.0

### Minor Changes

- 19f288a4: You can now see more context information in logs that should be helpful in debugging issues with the app.

### Patch Changes

- Updated dependencies [6f2d6abb]
  - @saleor/apps-otel@1.3.0

## 2.8.3

### Patch Changes

- fbdbaa28: Remove custom Next.js + Sentry error. It was causing non existing paths to be reported as 500 instead of 404. We catch Sentry errors in implicit anyway in api routes.
- Updated dependencies [fbdbaa28]
  - @saleor/sentry-utils@0.2.2

## 2.8.2

### Patch Changes

- 2f59041c: Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately
- Updated dependencies [2f59041c]
  - @saleor/sentry-utils@0.2.1

## 2.8.1

### Patch Changes

- 0c4ba39f: Update next.js config after Sentry rollback.
- Updated dependencies [0c4ba39f]
- Updated dependencies [0c4ba39f]
- Updated dependencies [5c851a6c]
  - @saleor/apps-otel@1.2.2
  - @saleor/apps-logger@1.2.8

## 2.8.0

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

## 2.7.6

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1
- Updated dependencies [64d88b24]
- Updated dependencies [5cbd3b63]
- Updated dependencies [e1ea31be]
  - @saleor/react-hook-form-macaw@0.2.7
  - @saleor/apps-logger@1.2.6
  - @saleor/apps-shared@1.10.3
  - @saleor/apps-otel@1.2.0
  - @saleor/apps-ui@1.2.5

## 2.7.5

### Patch Changes

- 4ffef6be: Update `@sentry/nextjs` to 8.0.0 version. It should help us with attaching additional data to Sentry errors.
- 2604ce1e: Updated Next.js to 14.2.3
- Updated dependencies [4ffef6be]
- Updated dependencies [2604ce1e]
  - @saleor/apps-logger@1.2.5
  - @saleor/apps-shared@1.10.2
  - @saleor/apps-ui@1.2.4
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 2.7.4

### Patch Changes

- Updated dependencies [eec25524]
  - @saleor/apps-logger@1.2.4

## 2.7.3

### Patch Changes

- Updated dependencies [528b981e]
  - @saleor/apps-logger@1.2.3

## 2.7.2

### Patch Changes

- f22f2b8a: Combine `APP_LOG_LEVEL` variable for `pino` & `tslog` libraries. After this change `APP_LOG_LEVEL` will take string which is one of `silent | trace | debug | info | warn | error | fatal`.
- Updated dependencies [f22f2b8a]
- Updated dependencies [df03c571]
  - @saleor/apps-logger@1.2.2
  - @saleor/apps-shared@1.10.1

## 2.7.1

### Patch Changes

- Updated dependencies [0a441ac9]
- Updated dependencies [f7ecb7bd]
  - @saleor/apps-logger@1.2.1

## 2.7.0

### Minor Changes

- b29318a2: Currently, Dashboard requires from a user to have "MANAGE_APPS" to have access to the apps tab.
  Since the release 3.20 Dashboard will allow all users to access to apps tabs without checking permission.
  This means that apps will be checking if the user has "MANAGE_APPS" internally and show message "You do not have permission to access this page" if the user does not have the permission.

### Patch Changes

- Updated dependencies [b29318a2]
  - @saleor/apps-shared@1.10.0

## 2.6.5

### Patch Changes

- 29d10d4a: Update Next.js to version 14.1.0.
- Updated dependencies [29d10d4a]
  - @saleor/apps-shared@1.9.4
  - @saleor/apps-ui@1.2.3
  - @saleor/apps-logger@1.2.0
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 2.6.4

### Patch Changes

- Updated dependencies [1e07a6ff]
  - @saleor/apps-logger@1.2.0

## 2.6.3

### Patch Changes

- 67afe8e4: Apps that use OTEL can now collect and send spans containing details about GraphQL requests.
- Updated dependencies [67afe8e4]
- Updated dependencies [67afe8e4]
  - @saleor/apps-shared@1.9.3
  - @saleor/apps-otel@1.1.0

## 2.6.2

### Patch Changes

- Updated dependencies [2683431]
  - @saleor/apps-logger@1.1.1

## 2.6.1

### Patch Changes

- Updated dependencies [93848f2]
- Updated dependencies [93848f2]
  - @saleor/apps-logger@1.1.0

## 2.6.0

### Minor Changes

- d9e4cb3: Implemented Open Telemetry traces, replaced logger with one compatible with OTEL

### Patch Changes

- 0849d8e: Applied logger from shared @saleor/apps-logger package
- Updated dependencies [d9e4cb3]
- Updated dependencies [0849d8e]
  - @saleor/apps-otel@1.0.0
  - @saleor/apps-logger@1.0.0

## 2.5.4

### Patch Changes

- 3f21682: Reduced available Vercel RAM from 1GB to 512MB

## 2.5.3

### Patch Changes

- 5f564a0: Updated @saleor/app-sdk to 0.47.2

## 2.5.2

### Patch Changes

- 531e7c1: Disabled Sentry tracing and Replays by default

## 2.5.1

### Patch Changes

- 99f7066: Updated Macaw UI to 1.0.0-pre.7. Removed legacy Material UI dependency from older Macaw. Code was updated to work properly with some API changes
- Updated dependencies [99f7066]
  - @saleor/react-hook-form-macaw@0.2.6
  - @saleor/apps-shared@1.9.2
  - @saleor/apps-ui@1.2.2

## 2.5.0

### Minor Changes

- a50df02: Reduced Sentry traces sample rate to 0.1

### Patch Changes

- 1454572: Updated package contentful-management from 10.38.3 to 10.46.4
- f4c67e8: Updated TRPC version

## 2.4.2

### Patch Changes

- fdabc51: Mapped app-sdk package to root library
- Updated dependencies [fdabc51]
  - @saleor/apps-shared@1.9.1
  - @saleor/apps-ui@1.2.1

## 2.4.1

### Patch Changes

- 148a6d7: Updated Sentry to 7.77.0

## 2.4.0

### Minor Changes

- 958dbcd: Changed how Contentful ID is created.

  Previously, Saleor's ID was used to create entry in Contentful.
  However, this implementation was failing when special characters in ID occurred (like "==").

  Now, entry in Contentful is created using it's own system ID, generated by Contentful itself.

  App will first query entries via variant ID field, so it still works without a breaking change.

  It's recommended to set "unique" parameter on variant ID field

## 2.3.4

### Patch Changes

- 1f7f472: Fixed the issue with `uploadProductVariant` error not being captured in Sentry.

## 2.3.3

### Patch Changes

- 5d3d81d: Bumped @hookform/resolvers from 2.9.11 to 3.3.1
- 5dee65a: Updated dependencies:
  - @graphql-codegen/cli@5.0.0
- 2e29699: Updated Sentry package

## 2.3.2

### Patch Changes

- e8660e8: Extracted UI components and use shared package
- 30140ee: Improved some text typos.
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
  - @saleor/apps-shared@1.9.0
  - @saleor/apps-ui@1.2.0

## 2.3.1

### Patch Changes

- a81f061: Updated Macaw to pre-127
- d9d0f64: Fixed background color of the modal. Previously white background was missing and only blur was applied. Now it is blurred and white with an opacity (in the dark mode it is fixed with dark grey)
- fcc37e7: Remove clsx package from the projects no longer using it.
- Updated dependencies [2a1385b]
- Updated dependencies [a81f061]
- Updated dependencies [fcc37e7]
  - @saleor/apps-shared@1.8.1
  - @saleor/react-hook-form-macaw@0.2.5
  - @saleor/apps-ui@1.1.8

## 2.3.0

### Minor Changes

- 6f1c5c9: Added Payload CMS support.

### Patch Changes

- e9378e7: Fix PayloadCMS form where two inputs were stuck together without a margin. Now, they are placed in two columns
- 6f1c5c9: Fix styling of modal in the dark mode

## 2.2.2

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118
- c50797e: Extracted MetadataManager creation to factory from shared package
- Updated dependencies [8b3d961]
- Updated dependencies [c50797e]
  - @saleor/react-hook-form-macaw@0.2.4
  - @saleor/apps-shared@1.8.0
  - @saleor/apps-ui@1.1.7

## 2.2.1

### Patch Changes

- 3002354: Added error logging for exceptions thrown at tRPC routes.

## 2.2.0

### Minor Changes

- fe767a4: Changed public (manifest) name app to be "CMS" (previously it was "CMS 2", since two apps existed at the same time)

## 2.1.2

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged
- Updated dependencies [261957f]
  - @saleor/react-hook-form-macaw@0.2.3
  - @saleor/apps-shared@1.7.6
  - @saleor/apps-ui@1.1.6

## 2.1.1

### Patch Changes

- 2fab86b: Updated graphql package to 16.7.1 and @graphql-codegen related dependencies to the latest version.
- aa6fec1: Updated Macaw UI to pre-106
- 4578659: Made Builder.io api keys inputs type of "password" so they are masked now
- Updated dependencies [aa6fec1]
- Updated dependencies [aa6fec1]
  - @saleor/react-hook-form-macaw@0.2.2
  - @saleor/apps-shared@1.7.5
  - @saleor/apps-ui@1.1.5

## 2.1.0

### Minor Changes

- 5d41af9: Added validation for channel-provider connection. Now form will display error when user tries to add a connection that already exists.
- 5d41af9: Added set of improvements around app quality

  - Ensured forms have fields properly set as "required", so form validation will prevent empty form submissions
  - Contentful and DatoCMS forms now validate the credentials.
  - Added logs (server side) in various places
  - Bulk sync finished now triggers notification

- 5d41af9: Added skeletons instead raw "Loading" texts. Also removed unnecessary warning message in bulk sync section

### Patch Changes

- Updated dependencies [70cb741]
- Updated dependencies [e7c2d3a]
- Updated dependencies [3c6cd4c]
- Updated dependencies [6210447]
  - @saleor/react-hook-form-macaw@0.2.1
  - @saleor/apps-shared@1.7.4
  - @saleor/apps-ui@1.1.4

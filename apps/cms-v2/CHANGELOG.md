# saleor-app-cms-v2

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

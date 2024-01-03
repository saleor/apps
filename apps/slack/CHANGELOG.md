# saleor-app-slack

## 1.10.0

### Minor Changes

- 53167f2: Added enabling & disabling webhooks feature. Now, when webhook handler detects missing or broken (check URL format) configuration, it will call Saleor to disable webhooks. This will save some traffic. On the other hand, when configuration is set again, webhooks will be enabled. Only existence of string value is checked for now.

  For new installations, app will register disabled webhook, until configured.

- f54f252: Added built-in html validation for configuration input - to validate against URL format.

## 1.9.4

### Patch Changes

- de4b214: Reduced amount of ORDER_CREATED webhook's max memory usage from 1GB to 256MB.

## 1.9.3

### Patch Changes

- 5f564a0: Updated @saleor/app-sdk to 0.47.2

## 1.9.2

### Patch Changes

- 531e7c1: Disabled Sentry tracing and Replays by default

## 1.9.1

### Patch Changes

- 99f7066: Updated Macaw UI to 1.0.0-pre.7. Removed legacy Material UI dependency from older Macaw. Code was updated to work properly with some API changes
- Updated dependencies [99f7066]
  - @saleor/react-hook-form-macaw@0.2.6
  - @saleor/apps-shared@1.9.2
  - @saleor/apps-ui@1.2.2

## 1.9.0

### Minor Changes

- a50df02: Reduced Sentry traces sample rate to 0.1

## 1.8.9

### Patch Changes

- fdabc51: Mapped app-sdk package to root library
- Updated dependencies [fdabc51]
  - @saleor/apps-shared@1.9.1
  - @saleor/apps-ui@1.2.1

## 1.8.8

### Patch Changes

- 148a6d7: Updated Sentry to 7.77.0

## 1.8.7

### Patch Changes

- 5dee65a: Updated dependencies:
  - @graphql-codegen/cli@5.0.0
- 2e29699: Updated Sentry package

## 1.8.6

### Patch Changes

- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
- Updated dependencies [e8660e8]
  - @saleor/apps-shared@1.9.0
  - @saleor/apps-ui@1.2.0

## 1.8.5

### Patch Changes

- a81f061: Updated Macaw to pre-127
- fcc37e7: Remove clsx package from the projects no longer using it.
- Updated dependencies [2a1385b]
- Updated dependencies [a81f061]
- Updated dependencies [fcc37e7]
  - @saleor/apps-shared@1.8.1
  - @saleor/react-hook-form-macaw@0.2.5
  - @saleor/apps-ui@1.1.8

## 1.8.4

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118
- Updated dependencies [8b3d961]
- Updated dependencies [c50797e]
  - @saleor/react-hook-form-macaw@0.2.4
  - @saleor/apps-shared@1.8.0
  - @saleor/apps-ui@1.1.7

## 1.8.3

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged
- Updated dependencies [261957f]
  - @saleor/react-hook-form-macaw@0.2.3
  - @saleor/apps-shared@1.7.6
  - @saleor/apps-ui@1.1.6

## 1.8.2

### Patch Changes

- 2fab86b: Updated graphql package to 16.7.1 and @graphql-codegen related dependencies to the latest version.
- aa6fec1: Updated Macaw UI to pre-106
- Updated dependencies [aa6fec1]
- Updated dependencies [aa6fec1]
  - @saleor/react-hook-form-macaw@0.2.2
  - @saleor/apps-shared@1.7.5
  - @saleor/apps-ui@1.1.5

## 1.8.1

### Patch Changes

- e7c2d3a: Updated and ESLint dependencies
- 3c6cd4c: Updated the @saleor/app-sdk package to version 0.41.1.
- 6210447: Updated tRPC packages to 10.34.0
- Updated dependencies [70cb741]
- Updated dependencies [e7c2d3a]
- Updated dependencies [3c6cd4c]
- Updated dependencies [6210447]
  - @saleor/react-hook-form-macaw@0.2.1
  - @saleor/apps-shared@1.7.4
  - @saleor/apps-ui@1.1.4

## 1.8.0

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

## 1.7.0

### Minor Changes

- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.
- 57fea91: Rewritten UI to use modern macaw UI, instead legacy one with Material UI. There are slight changes in typography and spacings, but no new changes were introduced.

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

## 1.6.6

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
  - @saleor/apps-shared@1.7.1

## 1.6.5

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/apps-shared@1.7.0

## 1.6.4

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.6.3

### Patch Changes

- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 1.6.2

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- Updated dependencies [c406318]
  - @saleor/apps-shared@1.5.1

## 1.6.1

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 1.6.0

### Minor Changes

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

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

## 1.4.1

### Patch Changes

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
- e746cf9: Billing address is now also included into Slack message. Additonally user emails is always defined

### Patch Changes

- e746cf9: Fix problem with "undefined" user's name & last name in case they are not available.
  Introduces "n/a" fallback

## 1.1.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable
- 5fc88ed: Add shared theme provider with color overrides and globals

### Patch Changes

- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

## 1.0.2

### Patch Changes

- b874d10: Update @saleor/app-sdk to 0.29.0
- Updated dependencies [648d99b]
  - @saleor/apps-shared@1.1.1

## 1.0.1

### Patch Changes

- 9f843b2: Update imports to @saleor/apps-shared
- 9f843b2: Remove generated folders form git history
- 9f843b2: Use TitleBar and AppIcon from Shared package
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
  - @saleor/apps-shared@1.1.0

## 1.0.0

### Major Changes

- 77538e4: Add slack into the workspace

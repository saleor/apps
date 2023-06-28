# saleor-app-data-importer

## 1.8.0

### Minor Changes

- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.

### Patch Changes

- 860bac4: Updated @saleor/app-sdk to 0.40.1
- a1ad70e: Updated configuration and dependencies of GraphQL client - urql.
  All applications use now unified config for creating the client. Also unused related packages has been removed.
- ec68ed5: Updated Sentry package and config. Set Sentry release to match package.json version. Now Sentry will use semver version instead a commit
- cb6ee29: Updated dependencies
- Updated dependencies [860bac4]
- Updated dependencies [a1ad70e]
- Updated dependencies [cb6ee29]
- Updated dependencies [a1ad70e]
  - @saleor/apps-shared@1.7.2

## 1.7.6

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

## 1.7.5

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/apps-shared@1.7.0

## 1.7.4

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.7.3

### Patch Changes

- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 1.7.2

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- Updated dependencies [c406318]
  - @saleor/apps-shared@1.5.1

## 1.7.1

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 1.7.0

### Minor Changes

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

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

## 1.5.1

### Patch Changes

- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 1.5.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 1.4.3

### Patch Changes

- e93a4dc: Updated GraphQL Code Generator package

## 1.4.2

### Patch Changes

- dca82bb: Update app-sdk to pre-0.34.0. Update Async Webhooks to use new API

## 1.4.1

### Patch Changes

- 2755ed2: Added extra padding on top of the app so it has some space between content and dashboard header
- 2755ed2: Change main title header to be smaller

## 1.4.0

### Minor Changes

- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context
- 3e612ca: App now is configured with Sentry Wizard and will log to sentry if proper env variables are set

### Patch Changes

- Updated dependencies [2d23480]
  - @saleor/apps-shared@1.3.0

## 1.3.0

### Minor Changes

- 289b42f: Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own.
  Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md
- 1da5be3: Add dark mode styling
- 1da5be3: Enable origins check for installation via env variables

  Update app-sdk

  Set Nuvo development mode based on env variables

### Patch Changes

- 6327586: Add naive dark mode by inverting colors
- 1da5be3: Add valid icon and color

## 1.2.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable

### Patch Changes

- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

## 1.1.3

### Patch Changes

- b874d10: Update @saleor/app-sdk to 0.29.0
- Updated dependencies [648d99b]
  - @saleor/apps-shared@1.1.1

## 1.1.2

### Patch Changes

- 9f843b2: Update imports to @saleor/apps-shared
- 9f843b2: Remove generated folders form git history
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
  - @saleor/apps-shared@1.1.0

## 1.1.1

### Patch Changes

- a641caf: Extract isInIframe to new shared package and use it in apps
- Updated dependencies [a641caf]
  - @saleor/apps-shared@1.0.1

## 1.1.0

### Minor Changes

- 7aabcdc: Update dependencies

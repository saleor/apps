# saleor-app-invoices

## 1.14.0

### Minor Changes

- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.

### Patch Changes

- 8b245c6: Improved error handling in Webhook INVOICE_CREATED. Now Sentry will gather additional breadcrumbs for better debugging. No PII is logged
- 59ff617: Fixed "Not enough permissions" error during configuration management.
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

## 1.13.6

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo
- 928c727: Updated @saleor/macaw-ui to 0.8.0-pre.95. This version introduces change in spacing scale, so there may be slight changes in spacing
- a8834a1: Enabled eslint during build
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
  - @saleor/apps-shared@1.7.1

## 1.13.5

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/apps-shared@1.7.0

## 1.13.4

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.13.3

### Patch Changes

- 23b5c70: Moved Semver compatibility checking to shared package, removed semver library
- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 1.13.2

### Patch Changes

- 5e903ae: Update app-sdk to 0.38.0

## 1.13.1

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- 403bcf8: Update @saleor/app-sdk to 0.8.0-pre.84
- Updated dependencies [c406318]
  - @saleor/apps-shared@1.5.1

## 1.13.0

### Minor Changes

- ccd8250: Major update of the App UI and behavior:

  - Replaced old Macaw/MUI with @saleor/macaw-ui/next (new UI, new look)
  - Changed App behavior how settings are stored. Before - it cloned shop data and stored it per-channel in App settings (metadata). Now it uses Shop data by default + overrides per channel

  App includes migration code, it should work seamlessly and update its settings/schema automatically.

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable
- ee1a4af: Fixed address form not loading if not data was set before

## 1.12.0

### Minor Changes

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

- 830cfe9: Replaced internal logger implementation with shared logger
- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

## 1.11.0

### Minor Changes

- 57f6d41: Updated Manifest to contain up to date support, privacy, homepage and author fields

### Patch Changes

- 2c0df91: Added lint:fix script, so `eslint --fix` can be run deliberately
- e167e72: Update next.js to 13.3.0
- 74174c4: Updated @saleor/app-sdk to 0.37.3
- 2e51890: Update next.js to 13.3.0
- 1fef68b: Changed how Saleor version is validated during installation, to use dedicated SaleorVersionCompatibilityValidator. It also doesnt "coerce" version anymore, but uses "includePrelease" flag instead. This should match actual Saleor versioning better
- 2e51890: Update @saleor/app-sdk to 0.37.2
- 1fef68b: Use REQUIRED_SALEOR_VERSION from manifest in app's own Saleor version validation
- 2e51890: Use useDashboardNotification hook from shared package, instead of direct AppBridge usage
- Updated dependencies [2c0df91]
- Updated dependencies [e167e72]
- Updated dependencies [74174c4]
- Updated dependencies [2e51890]
- Updated dependencies [2e51890]
- Updated dependencies [2e51890]
  - @saleor/apps-shared@1.4.0

## 1.10.0

### Minor Changes

- d0af8bd: App Manifest was extended to have minimum required Saleor version >= 3.10. Invoices events don't work correctly in older Saleor versions

## 1.9.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 1.8.1

### Patch Changes

- dab0f93: When TEMP_PDF_STORAGE_DIR env is not set, app will automatically create and write to \_temp directory relative to file that resolves a path.
  In development this will be a file inside .next folder. In production it's recommended to set TEMP_PDF_STORAGE_DIR, especially using Vercel
- e93a4dc: Updated GraphQL Code Generator package

## 1.8.0

### Minor Changes

- 639dfc3: App no longer shows initial loading spinner. It renders nothing until initial required data (channels) are fetched. When this happens, AppBridge informs Dashboard (via NotifyReady action) that it can be displayed.

### Patch Changes

- 639dfc3: Removed frontend GraphQL provider, because no frontend queries are used
  - @saleor/apps-shared@1.3.0

## 1.7.2

### Patch Changes

- dca82bb: Update app-sdk to pre-0.34.0. Update Async Webhooks to use new API

## 1.7.1

### Patch Changes

- 2755ed2: Added extra padding on top of the app so it has some space between content and dashboard header

## 1.7.0

### Minor Changes

- 55c8f1a: App now validates Saleor version and will fail if lower than 3.10
- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

### Patch Changes

- 2d23480: Add homepage and support url to manifest
- Updated dependencies [2d23480]
  - @saleor/apps-shared@1.3.0

## 1.6.0

### Minor Changes

- 289b42f: Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own.
  Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md

### Patch Changes

- 4e4257d: Ensure initially selected channel will not crash if no channels exist

## 1.5.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable
- 5fc88ed: Add shared theme provider with color overrides and globals

### Patch Changes

- b3178b2: Improve UI - better styling, headers
- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

## 1.4.0

### Minor Changes

- b874d10: Add logging error in SaleorAsyncWebhook

### Patch Changes

- b874d10: Update @saleor/app-sdk to 0.29.0
- Updated dependencies [648d99b]
  - @saleor/apps-shared@1.1.1

## 1.3.0

### Minor Changes

- c1dab0b: Unsticky app cards and change loader type

## 1.2.0

### Minor Changes

- 0219561: Remove firstName and lastName fields in billing address of a company

## 1.1.3

### Patch Changes

- 9f843b2: Update imports to @saleor/apps-shared
- 9f843b2: Remove generated folders form git history
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
  - @saleor/apps-shared@1.1.0

## 1.1.2

### Patch Changes

- a641caf: Extract isInIframe to new shared package and use it in apps
- a641caf: Update deps and disable SSR mode in trpc
- Updated dependencies [a641caf]
  - @saleor/apps-shared@1.0.1

## 1.1.1

### Patch Changes

- 21f0a60: Link local eslint config to package json

## 1.1.0

### Minor Changes

- 569a187: Remove VercelAPL from SaleorApp

# saleor-app-data-importer

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

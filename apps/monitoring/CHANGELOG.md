# saleor-app-monitoring

## 0.6.5

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/apps-shared@1.7.0

## 0.6.4

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 0.6.3

### Patch Changes

- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 0.6.2

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- Updated dependencies [c406318]
  - @saleor/apps-shared@1.5.1

## 0.6.1

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 0.6.0

### Minor Changes

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

## 0.5.0

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

## 0.4.1

### Patch Changes

- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 0.4.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 0.3.3

### Patch Changes

- e93a4dc: Updated GraphQL Code Generator package

## 0.3.2

### Patch Changes

- dca82bb: Update app-sdk to pre-0.34.0. Update Async Webhooks to use new API

## 0.3.1

### Patch Changes

- 2755ed2: Added extra padding on top of the app so it has some space between content and dashboard header

## 0.3.0

### Minor Changes

- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

### Patch Changes

- Updated dependencies [2d23480]
  - @saleor/apps-shared@1.3.0

## 0.2.0

### Minor Changes

- 289b42f: Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own.
  Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md

## 0.1.1

### Patch Changes

- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

# saleor-app-cms

## 1.2.0

### Minor Changes

- 1da5163: Redesigned the app to better match new Dashboard

### Patch Changes

- 246b943: Provider configurations UI fixes
- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 1.1.0

### Minor Changes

- b80df17: Added Sentry integration
- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

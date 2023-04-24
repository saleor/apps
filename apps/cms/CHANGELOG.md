# saleor-app-cms

## 1.3.1

### Patch Changes

- fc06648: CMS visual fixes

## 1.3.0

### Minor Changes

- 57f6d41: Updated Manifest to contain up to date support, privacy, homepage and author fields

### Patch Changes

- 2c0df91: Added lint:fix script, so `eslint --fix` can be run deliberately
- e167e72: Update next.js to 13.3.0
- 74174c4: Updated @saleor/app-sdk to 0.37.3
- 2e51890: Update next.js to 13.3.0
- a3636f7: Fix CMS app issues
  Check if CMS provider instance configuration is working
- 2e51890: Update @saleor/app-sdk to 0.37.2
- 2e51890: Use useDashboardNotification hook from shared package, instead of direct AppBridge usage
- Updated dependencies [2c0df91]
- Updated dependencies [e167e72]
- Updated dependencies [74174c4]
- Updated dependencies [2e51890]
- Updated dependencies [2e51890]
- Updated dependencies [2e51890]
  - @saleor/apps-shared@1.4.0

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

# saleor-app-emails-and-messages

## 1.4.0

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

## 1.3.1

### Patch Changes

- eca52ad: Replace "export default" with named exports
  - @saleor/apps-shared@1.3.0

## 1.3.0

### Minor Changes

- d0af8bd: App Manifest was extended to have minimum required Saleor version >= 3.10. Invoices events don't work correctly in older Saleor versions

## 1.2.0

### Minor Changes

- 14ac614: Enable Sendgrid support

### Patch Changes

- 9d625fc: Improve instructions for the app configuration

## 1.1.0

### Minor Changes

- 7cb3b89: Added "author" field to the Manifest, set it to Saleor Commerce, so Dashboard can display it too

### Patch Changes

- 7cb3b89: Replace apps to avoid AppPermission (use Permission for client permissions) and authData.domain (use saleorApiUrl)
- a44aaf0: Fixed SMTP auth data not being properly passed to the sending service
- 7cb3b89: Updated @saleor/app-sdk to 0.37.1

## 1.0.1

### Patch Changes

- 3b694d1: Improve styles and layout of the emails app configuration views. Make event template editing view responsive.
- e93a4dc: Updated GraphQL Code Generator package

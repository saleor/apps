# saleor-app-emails-and-messages

## 1.8.0

### Minor Changes

- 1dead1e: Included dedicated logo and attached it to App's manifest. From Saleor 3.15 the logo will be visible in the Dashboard during and after installation.
- 82dfc3f: Webhooks are no longer created during the app registration. Instead, the app will subscribe events based on it's configuration, after change has been detected.

  This change does not have negative impact on existing app installations - webhooks will be removed during next change of the provider configuration.

### Patch Changes

- 59ff617: Fixed "Not enough permissions" error during configuration management.
- 860bac4: Updated @saleor/app-sdk to 0.40.1
- a1ad70e: Updated configuration and dependencies of GraphQL client - urql.
  All applications use now unified config for creating the client. Also unused related packages has been removed.
- 00e49ba: Improved descriptions in the events section and API key inputs.
- 6250095: Added support for new event - Gift Card Sent. The event is available for Saleor version 3.13 and above.
- ec68ed5: Updated Sentry package and config. Set Sentry release to match package.json version. Now Sentry will use semver version instead a commit
- cb6ee29: Updated dependencies
- 8287075: Events section UI has been updated. All events are displayed now as single table.
- Updated dependencies [f96563f]
- Updated dependencies [f96563f]
- Updated dependencies [860bac4]
- Updated dependencies [a1ad70e]
- Updated dependencies [cb6ee29]
- Updated dependencies [a1ad70e]
  - @saleor/react-hook-form-macaw@0.2.0
  - @saleor/apps-ui@1.1.2
  - @saleor/apps-shared@1.7.2

## 1.7.1

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- cce2fbc: Improved layout spacing across the application.
- e106ab9: Added improved descriptions in the Sendgrid configuration views.
- a8834a1: Unified graphql codegen packages
- e106ab9: Added improved descriptions in the Sendgrid configuration views.
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo
- 928c727: Updated @saleor/macaw-ui to 0.8.0-pre.95. This version introduces change in spacing scale, so there may be slight changes in spacing
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [a8834a1]
- Updated dependencies [928c727]
  - @saleor/react-hook-form-macaw@0.1.2
  - @saleor/apps-shared@1.7.1
  - @saleor/apps-ui@1.1.1

## 1.7.0

### Minor Changes

- 8003064: App UI has been redesigned to our new components library.

  Configurations can be now assigned to multiple channels. Previously the configurations had to be duplicated.

  MJML provides has been renamed to SMTP. New name better reflects how the emails are sent - MJML is a name of the templating language.

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds
- Updated dependencies [0c2fc65]
- Updated dependencies [b75a664]
  - @saleor/react-hook-form-macaw@0.1.1
  - @saleor/apps-shared@1.7.0

## 1.6.1

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1
- Updated dependencies [6e69f4f]
  - @saleor/apps-shared@1.6.1

## 1.6.0

### Minor Changes

- 4801803: Added Sentry config. If Sentry is configured in ENV, it will use default Sentry configuration for Next.js to send errors to the Sentry

### Patch Changes

- Updated dependencies [23b5c70]
  - @saleor/apps-shared@1.6.0

## 1.5.2

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0
- Updated dependencies [c406318]
  - @saleor/apps-shared@1.5.1

## 1.5.1

### Patch Changes

- 8b22b1c: Restored Pino logger packages to each app, to fix failing logs in development. Also updated .env.example to contain up to date APP_LOG_LEVEL variable

## 1.5.0

### Minor Changes

- 830cfe9: Changed APP_DEBUG env to APP_LOG_LEVEL

### Patch Changes

- 830cfe9: Replaced internal logger implementation with shared logger
- Updated dependencies [830cfe9]
  - @saleor/apps-shared@1.5.0

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

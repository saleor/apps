# @saleor/apps-shared

## 1.7.2

### Patch Changes

- 860bac4: Updated @saleor/app-sdk to 0.40.1
- a1ad70e: Updated configuration and dependencies of GraphQL client - urql.
  All applications use now unified config for creating the client. Also unused related packages has been removed.
- cb6ee29: Updated dependencies
- a1ad70e: Added `createGraphQLClient` function to shared package. Can be used to create urql client instance with optional authorization.

## 1.7.1

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo

## 1.7.0

### Minor Changes

- b75a664: Disabled possibility to create logger if level is DEBUG or TRACE and NODE_ENV is production. This is an additional protection for logging sensitive data.

### Patch Changes

- 0c2fc65: Update dev dependencies - Vite and Vitest. These changes will not affect runtime Apps, but can affect tests and builds

## 1.6.1

### Patch Changes

- 6e69f4f: Update app-sdk to 0.39.1

## 1.6.0

### Minor Changes

- 23b5c70: Add SaleorCompatibilityValidator util that compares semver version of the app and Saleor's

## 1.5.1

### Patch Changes

- c406318: Updated dep @saleor/app-sdk to 0.38.0

## 1.5.0

### Minor Changes

- 830cfe9: Add Pino logger and renamed required env to be APP_LOG_LEVEL

## 1.4.0

### Minor Changes

- 2e51890: Added useDashboardNotification hook, that allows quick access to AppBridge.dispatch(Notification())

### Patch Changes

- 2c0df91: Added lint:fix script, so `eslint --fix` can be run deliberately
- e167e72: Update next.js to 13.3.0
- 74174c4: Updated @saleor/app-sdk to 0.37.3
- 2e51890: Update next.js to 13.3.0
- 2e51890: Update @saleor/app-sdk to 0.37.2

## 1.3.0

### Minor Changes

- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

## 1.2.0

### Minor Changes

- 5fc88ed: Add shared theme provider with color overrides and globals

## 1.1.1

### Patch Changes

- 648d99b: Remove not needed console log

## 1.1.0

### Minor Changes

- 9f843b2: Add main-bar and app-icon
- 9f843b2: Make TitleBar sticky to the top
- 9f843b2: Allow icon, text and theme to AppIcon
- 9f843b2: Add root index file

### Patch Changes

- 9f843b2: Remove generated folders form git history

## 1.0.1

### Patch Changes

- a641caf: Extract isInIframe to new shared package and use it in apps

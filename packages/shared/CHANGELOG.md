# @saleor/apps-shared

## 1.11.4

### Patch Changes

- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.

## 1.11.3

### Patch Changes

- 83ad6531: Updated Node.js to 22.11

## 1.11.2

### Patch Changes

- 6fed4b19: Migrate to new newest MacawUI version. Functionally nothing has changed. UI may look a bit different but it will be on par with Dashboard UI.

## 1.11.1

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.

## 1.11.0

### Minor Changes

- c4dcb863: Remove Pino logger library. It was already deprecated but for non migrated apps it was causing build errors. Right now we have one logger - @saleor/app-logger pkg.

### Patch Changes

- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.

## 1.10.3

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1

## 1.10.2

### Patch Changes

- 2604ce1e: Updated Next.js to 14.2.3

## 1.10.1

### Patch Changes

- f22f2b8a: Combine `APP_LOG_LEVEL` variable for `pino` & `tslog` libraries. After this change `APP_LOG_LEVEL` will take string which is one of `silent | trace | debug | info | warn | error | fatal`.

## 1.10.0

### Minor Changes

- b29318a2: Currently, Dashboard requires from a user to have "MANAGE_APPS" to have access to the apps tab.
  Since the release 3.20 Dashboard will allow all users to access to apps tabs without checking permission.
  This means that apps will be checking if the user has "MANAGE_APPS" internally and show message "You do not have permission to access this page" if the user does not have the permission.

## 1.9.4

### Patch Changes

- 29d10d4a: Update Next.js to version 14.1.0.

## 1.9.3

### Patch Changes

- 67afe8e4: Allow passing prepending fetch exchange to urql client

## 1.9.2

### Patch Changes

- 99f7066: Updated Macaw UI to 1.0.0-pre.7. Removed legacy Material UI dependency from older Macaw. Code was updated to work properly with some API changes

## 1.9.1

### Patch Changes

- fdabc51: Mapped app-sdk package to root library

## 1.9.0

### Minor Changes

- e8660e8: Added GraphQL Provider component that build client side graphql context
- e8660e8: Added getAppBaseUrl function that infers apps own URL
- e8660e8: Added ThemeSynchronizer component that automatically syncs AppBridge and Macaw theme

### Patch Changes

- e8660e8: Removed ThemeProvider that was legacy for the older Macaw/Material UI

## 1.8.1

### Patch Changes

- 2a1385b: Plaintext EditorJS renderer has been moved to the shared package.
- a81f061: Updated Macaw to pre-127
- fcc37e7: Remove clsx package from the projects no longer using it.

## 1.8.0

### Minor Changes

- c50797e: Added Metadata Manager factory that abstract creation of EncryptedMetadataManager from SDK

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118

## 1.7.6

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged

## 1.7.5

### Patch Changes

- aa6fec1: Updated Macaw UI to pre-106

## 1.7.4

### Patch Changes

- 70cb741: Update Zod to 3.21.4
- e7c2d3a: Updated and ESLint dependencies
- 3c6cd4c: Updated the @saleor/app-sdk package to version 0.41.1.

## 1.7.3

### Patch Changes

- 2d77bca: Updated Next.js to 13.4.8
- 6299e06: Update @saleor/app-sdk to 0.41.0

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

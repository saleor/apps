# @saleor/sentry-utils

## 0.2.3

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.

## 0.2.2

### Patch Changes

- fbdbaa28: Remove not used deps for sentry

## 0.2.1

### Patch Changes

- 2f59041c: Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately

## 0.2.0

### Minor Changes

- 1a9912f5: Setup Sentry inside Next.js instrumentation file. It ensures that Sentry works properly for serverless environment.

### Patch Changes

- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.

## 0.1.0

### Minor Changes

- e7b909ed: Create sentry-utils module that will contain shared Sentry configuration. For now it exports release version that is used by Sentry during release.

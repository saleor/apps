# @saleor/apps-otel

## 2.4.0

### Minor Changes

- 37b91c88: Add `createTraceEffect` utility for tracing async operations with OTEL spans, adding logs, and configurable slow thresholds.

  **@saleor/apps-otel:**

  - `createTraceEffect` wraps operations with OTEL spans
  - Sets span attributes for duration, slow threshold, and custom attributes
  - Sets ERROR status when operations exceed slow threshold or fail
  - Records exceptions on failures
  - Supports optional logging callbacks (`onStart`, `onFinish`, `onSlow`, `onError`)

  Each app has to create it's own `createTraceEffect` with it's logger assigned to the callback methods, in order to have logs for slow operations.

## 2.3.1

### Patch Changes

- 98459d79: Updated Next.js to 15.2.6

## 2.3.0

### Minor Changes

- c68f1e9f: Change `TENANT_DOMAIN` observability attribute key name to be in sync with what Saleor uses (`saleor.environment.domain` instead of saleor.environment_domain`).

## 2.2.0

### Minor Changes

- e3c75265: Added new `createMetricsReader` factory to create periodic metric reader with proper headers.

### Patch Changes

- b4ed42c9: Add `PATH`, `SALEOR_EVENT` & `TENANT_DOMAIN` to observability attributes

## 2.1.5

### Patch Changes

- 1aff5e42: Add new helpers for Next.js app router.

## 2.1.4

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`

## 2.1.3

### Patch Changes

- da9899d5: Cleanup deps, peerDeps & devDependencies for package

## 2.1.2

### Patch Changes

- 6e94e99c: Fix wrong observability attribute name

## 2.1.1

### Patch Changes

- 996d9be1: Use [PNPM catalogs](https://pnpm.io/catalogs) feature to ensure that dependencies are in sync between different packages in monorepo.
- aa1c7597: Export new `ObservabilityAttributes`: `COMMIT_SHA`, `REPOSITORY_URL` & `VERCEL_ENV`

## 2.1.0

### Minor Changes

- 8154e9e9: Properly disable HTTP instrumentation for Sentry requests. Added `AwsInstrumentation` factory that can be used to auto instrument DynamoDB calls.

## 2.0.0

### Major Changes

- 3c4358ae: **BREAKING CHANGE**. Change package structure. After this change `@saleor/apps-otel` won't export `withOtel` wrapper but rather helpers or factories that should be used by apps to properly setup OTEL. See apps implementation on how to use new version.

### Minor Changes

- e3fe0f70: Update functions exported from package and deps.

### Patch Changes

- 9cfb8ace: Remove deprecated `SemanticAttributes.HTTP_URL` from `otelUrqlExchangeFactory` and use `ATTR_URL_FULL` instead
- defa0b60: Rename `wrapWithSpanAttributes` to `withSpanAttributes`. No changes to the end user.

## 1.3.5

### Patch Changes

- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.

## 1.3.4

### Patch Changes

- 83ad6531: Updated Node.js to 22.11

## 1.3.3

### Patch Changes

- f1025fae: Pass git commit sha as a version to Node SDK. This ensures that we can have version support for our monitoring service.

## 1.3.2

### Patch Changes

- 93969b2a: Patch OTEL dependency - it should handle NaN & Infinity values. It will ensure that logs are properly parsed and send to log service.

## 1.3.1

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.

## 1.3.0

### Minor Changes

- 6f2d6abb: Revert Vercel's waitUntil. Logs that were pushed via this API were broken and not delivered

## 1.2.2

### Patch Changes

- 0c4ba39f: Enable OTEL diagnostic logging. You can use ENABLE_OTEL_RUNTIME_LOGS env variable to enable logging. Use OTEL_LOG_LEVEL (one of error, warn, info, debug, verbose, all or none) to set enabled logging level.
- 0c4ba39f: Update next.js config after Sentry rollback.

## 1.2.1

### Patch Changes

- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.

## 1.2.0

### Minor Changes

- e1ea31be: Wrapped OTEL flushing logic with [waitUntil](https://vercel.com/docs/functions/functions-api-reference#waituntil).
  Now response from a webhook should be immediate, but flushing will not be terminated by Vercel.

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1

## 1.1.0

### Minor Changes

- 67afe8e4: Add urql exchange for GraphQL OTEL

## 1.0.0

### Major Changes

- d9e4cb3: Added initial OTEL setup with common, shared utilities

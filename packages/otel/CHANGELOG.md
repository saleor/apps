# @saleor/apps-otel

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

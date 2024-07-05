# @saleor/apps-logger

## 1.2.9

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.

## 1.2.8

### Patch Changes

- 5c851a6c: Link to proper sentry/nextjs version

## 1.2.7

### Patch Changes

- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.

## 1.2.6

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1

## 1.2.5

### Patch Changes

- 4ffef6be: Update `@sentry/nextjs` to 8.0.0 version. It should help us with attaching additional data to Sentry errors.

## 1.2.4

### Patch Changes

- eec25524: Send empty keys to OTEL. Thanks to that change our queries that consume OTEL will have access to falsy values.

## 1.2.3

### Patch Changes

- 528b981e: Add proper serialization of errors in Open Telemetry logs transport

## 1.2.2

### Patch Changes

- f22f2b8a: Combine `APP_LOG_LEVEL` variable for `pino` & `tslog` libraries. After this change `APP_LOG_LEVEL` will take string which is one of `silent | trace | debug | info | warn | error | fatal`.
- df03c571: Fix Sentry breadcrumbs transport, to properly parse dates

## 1.2.1

### Patch Changes

- 0a441ac9: Changed format of Sentry breadcrumbs "timestamp" attribute. Now date is sent as time integer
- f7ecb7bd: Logger context can now pass path and project_name to help with debugging

## 1.2.0

### Minor Changes

- 1e07a6ff: Added logger context utility. It can wrap function (api handler) to share context within its invocation.

## 1.1.1

### Patch Changes

- 2683431: Added tests for Logger (console transport and otel transport).

## 1.1.0

### Minor Changes

- 93848f2: Improved logger implementation internals. Now it will inherit parent-logger attributes (only 1 level, which is internal tslog limitation). It uses custom console printer if attached, by default doesn't print anything, because built-in pretty print is limited and has to be disabled.

### Patch Changes

- 93848f2: Fixed mapping inherited attributes in logger to be sent via otel. Now, child logger attributes will be merged with each single log arguments

## 1.0.0

### Major Changes

- 0849d8e: Extracted logger package, containing a Logger utility based on tslog package. It contains also transports for Otel and Sentry.

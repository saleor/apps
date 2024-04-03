# @saleor/apps-logger

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

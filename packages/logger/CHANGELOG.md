# @saleor/apps-logger

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

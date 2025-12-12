# @saleor/apps-logger

## 1.6.3

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0

## 1.6.2

### Patch Changes

- 98459d79: Updated Next.js to 15.2.6
- Updated dependencies [98459d79]
  - @saleor/errors@1.0.1
  - @saleor/apps-otel@2.3.1

## 1.6.1

### Patch Changes

- Updated dependencies [b07a2e12]
  - @saleor/errors@1.0.0

## 1.6.0

### Minor Changes

- d3702072: Move logger name to `logger.name` instead of adding it to logger message. Thanks to that log management software will properly ingest log name.

### Patch Changes

- Updated dependencies [c68f1e9f]
  - @saleor/apps-otel@2.3.0

## 1.5.5

### Patch Changes

- b4ed42c9: Added new methods on `LoggerContext` responsible for getting tenant domain & Saleor api url.
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
  - @saleor/apps-otel@2.2.0

## 1.5.4

### Patch Changes

- 1aff5e42: Add new helpers for Next.js app router.

## 1.5.3

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`

## 1.5.2

### Patch Changes

- da9899d5: Cleanup deps, peerDeps & devDependencies for package

## 1.5.1

### Patch Changes

- 996d9be1: Use [PNPM catalogs](https://pnpm.io/catalogs) feature to ensure that dependencies are in sync between different packages in monorepo.

## 1.5.0

### Minor Changes

- 23a31eb4: Remove not used OTEL log transport

## 1.4.3

### Patch Changes

- 9bbf9ee5: Increased Vercel log limit to new value - 256KB. See [announcement](https://vercel.com/changelog/updated-logging-limits-for-vercel-functions) blog post from Vercel for more details.
- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.

## 1.4.2

### Patch Changes

- 1e70b997: Fix Vercel runtime transport logs attribute order - attributes from logs context will be first so log attributes can override them.
- 83ad6531: Updated Node.js to 22.11

## 1.4.1

### Patch Changes

- 69992d56: Update modern-errors-serialize library so it supports excluding error property from serialization

## 1.4.0

### Minor Changes

- 92a2a5fd: If Vercel runtime transport log is exceeding Vercel log limit (4kb) error to Sentry will be logged as it won't be visible in log drain.

## 1.3.0

### Minor Changes

- d088ef37: Renamed exported `logger` to `rootLogger` so we avoid collision of names when using `logger` in monorepo. Also `createLogger` function has been removed in favour of app defining it in their codebase.

### Patch Changes

- 2f37f075: Added `VercelBuildtimeTransport` which can be used to log information during Vercel build time e.g webhook migrations output. Renamed old `attachLoggerVercelTransport` to `attachLoggerVercelRuntimeTransport`.
- 6d528dc6: Added missing OTEL attributes to `loggerVercelTransport`. They will be visible under `otel` key in log collection service.

  Attributes:

  - `span_id`
  - `trace_id`
  - `timestamp`

## 1.2.10

### Patch Changes

- 6be0103c: Added new transport `LoggerVercelTransport`. It is currently in experimental stage but it can be used to send logs directly to Vercel log drain. This transport has optional argument of `loggerContext` - if used you need to make sure that function is executed only on the server. If attaching of transport fails we will get Sentry error.

  Usage:

  ```ts
  import { logger } from "@saleor/apps-logger";
  import { attachLoggerVercelTransport } from "@saleor/apps-logger/node";
  import { loggerContext } from "./logger-context";
  import pkgJson from "./package.json";

  attachLoggerVercelTransport(logger, pkgJson.version, loggerContext);
  ```

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

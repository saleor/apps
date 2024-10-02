# smtp

## 1.2.12

### Patch Changes

- Updated dependencies [f1025fae]
  - @saleor/apps-otel@1.3.3

## 1.2.11

### Patch Changes

- Updated dependencies [93969b2a]
  - @saleor/apps-otel@1.3.2

## 1.2.10

### Patch Changes

- fe5d5d5e: Updated @saleor/app-sdk to 0.50.3. This version removes the limitation of body size for the webhook payloads.

## 1.2.9

### Patch Changes

- 45a47156: Updated @saleor/app-sdk to 0.50.2. No functional changes are introduced

## 1.2.8

### Patch Changes

- 6fed4b19: Migrate to new newest MacawUI version. Functionally nothing has changed. UI may look a bit different but it will be on par with Dashboard UI.
- Updated dependencies [6fed4b19]
  - @saleor/react-hook-form-macaw@0.2.10
  - @saleor/apps-shared@1.11.2
  - @saleor/apps-ui@1.2.8

## 1.2.7

### Patch Changes

- 9650998a: Now "mjml" is being treated as external and properly handled by "bundlePagesExternals" flag.

## 1.2.6

### Patch Changes

- b708a107: The "require" call was replaced by regular "import" which causes random timeouts on webhook processing in mjml usage.

## 1.2.5

### Patch Changes

- b487edb2: Now, the flag "bundlePagesExternals" was added, which means cold-starts should be decreased according to Vercel documentation.

## 1.2.4

### Patch Changes

- e93143c9: Error during rendering template is caught and logged
- 695f8f5c: Now, fetching settings from Saleor has defined timeout, that means sending email will fail when that timeout will be exceeded.

## 1.2.3

### Patch Changes

- 5763f5ea: You can now see the event in 'notify_user' OTEL logs.

## 1.2.2

### Patch Changes

- ea25bb83: Updated dependencies responsible for error handling.
- e38c1417: You can now find how to run and test each app in README file

## 1.2.1

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.
- Updated dependencies [17077505]
  - @saleor/react-hook-form-macaw@0.2.9
  - @saleor/sentry-utils@0.2.3
  - @saleor/apps-logger@1.2.9
  - @saleor/apps-shared@1.11.1
  - @saleor/apps-otel@1.3.1
  - @saleor/apps-ui@1.2.7

## 1.2.0

### Minor Changes

- dd76ea26: Added support for [Handlebars Helpers](https://github.com/helpers/handlebars-helpers) which adds more flexibility to the template syntax.

### Patch Changes

- dd76ea26: Added displaying of Handlebars error in template editor. Now if invalid syntax is entered, raw error will be displayed above the form

## 1.1.5

### Patch Changes

- 5fbf0437: Fixed error with webhooks timing out. Now root UseCase operation is wrapped with try/catch block, so if unhandled error occurs, response will be returned. Previously response was hanging until lambda was terminated.
- f199cf13: Changed how MJML compiler is imported in the app. Not it uses legacy require() instead of import. Previous syntax broke the app

## 1.1.4

### Patch Changes

- Updated dependencies [6f2d6abb]
  - @saleor/apps-otel@1.3.0

## 1.1.3

### Patch Changes

- fbdbaa28: Remove custom Next.js + Sentry error. It was causing non existing paths to be reported as 500 instead of 404. We catch Sentry errors in implicit anyway in api routes.
- Updated dependencies [fbdbaa28]
  - @saleor/sentry-utils@0.2.2

## 1.1.2

### Patch Changes

- 2f59041c: Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately
- Updated dependencies [2f59041c]
  - @saleor/sentry-utils@0.2.1

## 1.1.1

### Patch Changes

- 0c4ba39f: Update next.js config after Sentry rollback.
- Updated dependencies [0c4ba39f]
- Updated dependencies [0c4ba39f]
- Updated dependencies [5c851a6c]
  - @saleor/apps-otel@1.2.2
  - @saleor/apps-logger@1.2.8

## 1.1.0

### Minor Changes

- c4dcb863: Remove Pino logger library. It was already deprecated but for non migrated apps it was causing build errors. Right now we have one logger - @saleor/app-logger pkg.
- 1a9912f5: Setup Sentry inside Next.js instrumentation file. It ensures that Sentry works properly for serverless environment.

### Patch Changes

- f4885a48: Fixed template for ACCOUNT_PASSWORD_RESET. Now template shows properly reset_url variable instead confirm_url
- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.
- cc047b1d: Downgraded Sentry package to v7. Previous upgrade to 8.x cause Sentry to conflict with Open Telemetry setup and Sentry was not working
- b42b4a5b: Fixed logging errors. Now error payload should be visible in logger.error() invocations
- b42b4a5b: Changed Vercel settings. Now function will have ~25s to execute, instead of default 15. Also memory was adjusted to 400MB
- b42b4a5b: Fixed missing LoggerContext in TRPC endpoint. Now context for logs is passed properly in configuration paths
- Updated dependencies [37ecb246]
- Updated dependencies [c4dcb863]
- Updated dependencies [1a9912f5]
  - @saleor/apps-logger@1.2.7
  - @saleor/apps-otel@1.2.1
  - @saleor/react-hook-form-macaw@0.2.8
  - @saleor/sentry-utils@0.2.0
  - @saleor/apps-shared@1.11.0
  - @saleor/apps-ui@1.2.6

## 1.0.0

### Major Changes

- 02bb4277: SMTP app has been released as stable 1.0.0

### Patch Changes

- Updated dependencies [e7b909ed]
  - @saleor/sentry-utils@0.1.0

## 0.0.3

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1
- Updated dependencies [64d88b24]
- Updated dependencies [5cbd3b63]
- Updated dependencies [e1ea31be]
  - @saleor/react-hook-form-macaw@0.2.7
  - @saleor/apps-logger@1.2.6
  - @saleor/apps-shared@1.10.3
  - @saleor/apps-otel@1.2.0
  - @saleor/apps-ui@1.2.5

## 0.0.2

### Patch Changes

- 4ffef6be: Update `@sentry/nextjs` to 8.0.0 version. It should help us with attaching additional data to Sentry errors.
- 2604ce1e: Updated Next.js to 14.2.3
- 705a6812: Send additional properties from captured errors into Sentry. This should help us with debugging issues.
- Updated dependencies [4ffef6be]
- Updated dependencies [2604ce1e]
  - @saleor/apps-logger@1.2.5
  - @saleor/apps-shared@1.10.2
  - @saleor/apps-ui@1.2.4
  - @saleor/apps-otel@1.1.0
  - @saleor/react-hook-form-macaw@0.2.6

## 0.0.1

### Patch Changes

- Updated dependencies [eec25524]
  - @saleor/apps-logger@1.2.4

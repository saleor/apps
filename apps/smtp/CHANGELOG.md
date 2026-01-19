# saleor-app-smtp

## 1.4.7

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 1.4.6

### Patch Changes

- 2a4f27ad: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 1.4.5

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 1.4.4

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3

## 1.4.3

### Patch Changes

- d0340d6b: Increased memory limits in Vercel up to 512 MB, previously 400 MB for handling Saleor webhooks.

## 1.4.2

### Patch Changes

- 98459d79: Updated Next.js to 15.2.6
- b1f10da0: Added logs when app fails to install due to error in APL, or due to disallowed domain and when app installs successfully
- Updated dependencies [98459d79]
  - @saleor/apps-logger@1.6.2
  - @saleor/apps-otel@2.3.1
  - @saleor/react-hook-form-macaw@0.2.16
  - @saleor/sentry-utils@0.2.5
  - @saleor/apps-shared@1.14.1
  - @saleor/apps-ui@1.3.2

## 1.4.1

### Patch Changes

- 9b32f02e: Webhook errors from email provider no longer trigger automatic retries. When SMTP server errors occur, the webhook now returns a 400 status code instead of 500, preventing Saleor from repeatedly attempting to send emails that will fail due to configuration or provider issues.

## 1.4.0

### Minor Changes

- 16c6448f: After this change required Saleor version for running the app will be **3.20**

### Patch Changes

- 933441ef: Email templates will now be validated before saving them. Invalid templates cannot be saved to prevent errors when handling Saleor webhooks. Errors are now also shown when editing template with clear explanation on how to resolve them.
- 933441ef: App will now correctly parse email templates that use handlers from handlebars-helpers (e.g. `equals`). Previously app threw an error when clicking "Render template".
- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 1.3.19

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0

## 1.3.18

### Patch Changes

- f69a90d9: Fixed default payload for accountChangeEmailRequest and accountChangeEmailConfirm emails.

## 1.3.17

### Patch Changes

- 2c1eb3da: Improved error handling: some expected errors will be now handled

## 1.3.16

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1

## 1.3.15

### Patch Changes

- 51b4d859: Installed DynamoDB APL (controlled via env variable).

## 1.3.14

### Patch Changes

- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 1.3.13

### Patch Changes

- bf66a47c: Fix how we handle SMTP errors in SMTP app. After this change email sender won't be responsible for re-throwing errors. Instead use-case will catch errors and properly report them.

## 1.3.12

### Patch Changes

- @saleor/apps-logger@1.6.1

## 1.3.11

### Patch Changes

- Updated dependencies [00070dc3]
  - @saleor/apps-shared@1.13.0

## 1.3.10

### Patch Changes

- Updated dependencies [d3702072]
- Updated dependencies [c68f1e9f]
  - @saleor/apps-logger@1.6.0
  - @saleor/apps-otel@2.3.0

## 1.3.9

### Patch Changes

- e3c75265: Add new `ATTR_SERVICE_INSTANCE_ID` OTEL attribute to app instrumentation.
- 4c5c63d5: Use TypeScript unions instead of enums in types generated from Graphql files.
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
  - @saleor/apps-otel@2.2.0
  - @saleor/apps-shared@1.12.3
  - @saleor/apps-logger@1.5.5

## 1.3.8

### Patch Changes

- 94c52129: Update to Next.js 15
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-ui@1.2.12

## 1.3.7

### Patch Changes

- Updated dependencies [1aff5e42]
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5

## 1.3.6

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`
- Updated dependencies [a76465fb]
  - @saleor/apps-logger@1.5.3
  - @saleor/apps-otel@2.1.4

## 1.3.5

### Patch Changes

- 339518c2: Fixed how we initialize Sentry SDK for API routes when runtime is Node.js. After this change we will use `NodeClient` directly from Sentry SDK to avoid interfering with our OTEL setup. We also removed not needed Sentry integration for edge runtime

## 1.3.4

### Patch Changes

- c8e61ac2: Updated Sentry to 9.6.1
- da9899d5: Cleanup deps, peerDeps & devDependencies for package
- Updated dependencies [da9899d5]
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/apps-logger@1.5.2
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-otel@2.1.3
  - @saleor/apps-ui@1.2.12
  - @saleor/sentry-utils@0.2.4

## 1.3.3

### Patch Changes

- Updated dependencies [6e94e99c]
  - @saleor/apps-otel@2.1.2

## 1.3.2

### Patch Changes

- 996d9be1: Use [PNPM catalogs](https://pnpm.io/catalogs) feature to ensure that dependencies are in sync between different packages in monorepo.
- aa1c7597: Added new attributes to OTEL setup - it will allow better GitHub integration with our OTEL provider
- Updated dependencies [996d9be1]
- Updated dependencies [aa1c7597]
  - @saleor/react-hook-form-macaw@0.2.13
  - @saleor/apps-logger@1.5.1
  - @saleor/apps-shared@1.12.1
  - @saleor/apps-otel@2.1.1
  - @saleor/apps-ui@1.2.11
  - @saleor/sentry-utils@0.2.4

## 1.3.1

### Patch Changes

- Updated dependencies [8154e9e9]
  - @saleor/apps-otel@2.1.0

## 1.3.0

### Minor Changes

- 3c4358ae: Setup OTEL via instrumentation hook. After this change app will use [official way](https://nextjs.org/docs/14/app/building-your-application/optimizing/open-telemetry) of setting up OTEL. There are no visible changes to the end user.

### Patch Changes

- defa0b60: Rename `wrapWithSpanAttributes` to `withSpanAttributes`. No changes to the end user.
- e3fe0f70: Use `@vercel/otel` package to setup OTEL. After this change spans will be automatically flushed by Vercel.
- Updated dependencies [3c4358ae]
- Updated dependencies [9cfb8ace]
- Updated dependencies [e3fe0f70]
- Updated dependencies [23a31eb4]
- Updated dependencies [defa0b60]
- Updated dependencies [defa0b60]
  - @saleor/apps-otel@2.0.0
  - @saleor/apps-logger@1.5.0
  - @saleor/apps-shared@1.12.0

## 1.2.24

### Patch Changes

- b3e136b0: Add `saleor-app` prefix to `package.json` so names of npm app projects are in sync with names of Vercel projects. No visible changes to the user.

## 1.2.23

### Patch Changes

- 2f06b1e9: Bumping app-sdk to v0.52.0 - adding native APL support for vercel-kv and redis
- a8f63fc4: Modified vercel.json to allow multiple regions. Now Vercel will replicate function in "dub1" and "iad1"

## 1.2.22

### Patch Changes

- 0f0bff21: Move `ThemeSynchronizer` utility to shared packages.

## 1.2.21

### Patch Changes

- 0db174a8: Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.

## 1.2.20

### Patch Changes

- 9bbf9ee5: Increased Vercel log limit to new value - 256KB. See [announcement](https://vercel.com/changelog/updated-logging-limits-for-vercel-functions) blog post from Vercel for more details.
- 9bbf9ee5: Added new `LoggerVercelTransport` support. It will help us send logs to our infrastructure without need of OTEL unstable logs API.
- 9bbf9ee5: Escape ALLOWED_DOMAIN_PATTERN regex. It ensures that regex constructed from env variable is sanitized and can't be used to Denial of Service attack.
- 9bbf9ee5: Fixed autofixable linting issues. No functional changes.
- Updated dependencies [9bbf9ee5]
- Updated dependencies [9bbf9ee5]
  - @saleor/apps-logger@1.4.3
  - @saleor/react-hook-form-macaw@0.2.12
  - @saleor/apps-shared@1.11.4
  - @saleor/apps-otel@1.3.5
  - @saleor/apps-ui@1.2.10

## 1.2.19

### Patch Changes

- 83ad6531: Updated Node.js to 22.11
- Updated dependencies [1e70b997]
- Updated dependencies [83ad6531]
  - @saleor/apps-logger@1.4.2
  - @saleor/apps-otel@1.3.4
  - @saleor/react-hook-form-macaw@0.2.11
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.11.3
  - @saleor/apps-ui@1.2.9

## 1.2.18

### Patch Changes

- 69992d56: Update modern-errors-serialize library so it supports excluding error property from serialization
- Updated dependencies [69992d56]
  - @saleor/apps-logger@1.4.1

## 1.2.17

### Patch Changes

- Updated dependencies [92a2a5fd]
  - @saleor/apps-logger@1.4.0

## 1.2.16

### Patch Changes

- d088ef37: Use new way of creating logger from `@saleor/apps-logger`
- Updated dependencies [2f37f075]
- Updated dependencies [d088ef37]
- Updated dependencies [6d528dc6]
  - @saleor/apps-logger@1.3.0

## 1.2.15

### Patch Changes

- Updated dependencies [6be0103c]
  - @saleor/apps-logger@1.2.10

## 1.2.14

### Patch Changes

- 0ef7adde: You can now see the error log when sending email has timeout

## 1.2.13

### Patch Changes

- 8b66ff67: Processing webhook now logs the size of email and subject template

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

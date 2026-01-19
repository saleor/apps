# saleor-app-segment

## 2.2.5

### Patch Changes

- 560c3de4: Added logging to DynamoDB APL for better debugging and error visibility.

## 2.2.4

### Patch Changes

- 2a4f27ad: Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.

## 2.2.3

### Patch Changes

- 9e17703c: Updated tTRPC to 10.45.3

## 2.2.2

### Patch Changes

- Updated dependencies [37b91c88]
  - @saleor/apps-otel@2.4.0
  - @saleor/apps-logger@1.6.3

## 2.2.1

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
  - @saleor/webhook-utils@0.2.6

## 2.2.0

### Minor Changes

- 16c6448f: After this change required Saleor version for running the app will be **3.21**

### Patch Changes

- 86747b3c: When users open app outside of Saleor Dashboard's iframe we will now display an error message with explanation. Previously we rendered app's UI, which caused frontend to make requests to the app without any required data (tokens, saleorApiUrl, etc.) which resulted in error logs.

## 2.1.16

### Patch Changes

- Updated dependencies [6b9305d3]
  - @saleor/apps-shared@1.14.0

## 2.1.15

### Patch Changes

- 16b87f53: Update MacawUI to 1.3.0
- a7c1cedf: Updated @saleor/app-sdk to 1.3.0
- Updated dependencies [16b87f53]
  - @saleor/react-hook-form-macaw@0.2.15
  - @saleor/apps-shared@1.13.1
  - @saleor/apps-ui@1.3.1

## 2.1.14

### Patch Changes

- 4c6ab870: Used DynamoAPL from app-sdk instead local package.

## 2.1.13

### Patch Changes

- Updated dependencies [7a834f53]
- Updated dependencies [b1c0139a]
- Updated dependencies [7a834f53]
- Updated dependencies [674b4fa0]
  - @saleor/apps-ui@1.3.0

## 2.1.12

### Patch Changes

- fe605010: Update DynamoDB Toolbox to > v2, no function changes introduced
- b07a2e12: Extract DynamoDB APL to shared package
- Updated dependencies [b07a2e12]
  - @saleor/apl-dynamo@2.0.0
  - @saleor/apps-logger@1.6.1

## 2.1.11

### Patch Changes

- Updated dependencies [00070dc3]
  - @saleor/apps-shared@1.13.0

## 2.1.10

### Patch Changes

- c490ca75: Fixed link to Saleor docs. After this change links should point to the newest version of docs without redirects.
- Updated dependencies [d3702072]
- Updated dependencies [c68f1e9f]
  - @saleor/apps-logger@1.6.0
  - @saleor/apps-otel@2.3.0

## 2.1.9

### Patch Changes

- e3c75265: Add new `ATTR_SERVICE_INSTANCE_ID` OTEL attribute to app instrumentation.
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
- Updated dependencies [e3c75265]
- Updated dependencies [b4ed42c9]
  - @saleor/apps-otel@2.2.0
  - @saleor/apps-shared@1.12.3
  - @saleor/apps-logger@1.5.5

## 2.1.8

### Patch Changes

- 94c52129: Update to Next.js 15
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/sentry-utils@0.2.4
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-ui@1.2.12
  - @saleor/webhook-utils@0.2.5

## 2.1.7

### Patch Changes

- Updated dependencies [1aff5e42]
  - @saleor/apps-logger@1.5.4
  - @saleor/apps-otel@2.1.5

## 2.1.6

### Patch Changes

- a76465fb: Update `@saleor/app-sdk` to `v1.0.0`
- Updated dependencies [a76465fb]
  - @saleor/apps-logger@1.5.3
  - @saleor/apps-otel@2.1.4

## 2.1.5

### Patch Changes

- 339518c2: Fixed how we initialize Sentry SDK for API routes when runtime is Node.js. After this change we will use `NodeClient` directly from Sentry SDK to avoid interfering with our OTEL setup. We also removed not needed Sentry integration for edge runtime

## 2.1.4

### Patch Changes

- c8e61ac2: Updated Sentry to 9.6.1
- da9899d5: Cleanup deps, peerDeps & devDependencies for package
- Updated dependencies [da9899d5]
  - @saleor/react-hook-form-macaw@0.2.14
  - @saleor/webhook-utils@0.2.5
  - @saleor/apps-logger@1.5.2
  - @saleor/apps-shared@1.12.2
  - @saleor/apps-otel@2.1.3
  - @saleor/apps-ui@1.2.12
  - @saleor/sentry-utils@0.2.4

## 2.1.3

### Patch Changes

- Updated dependencies [6e94e99c]
  - @saleor/apps-otel@2.1.2

## 2.1.2

### Patch Changes

- 996d9be1: Use [PNPM catalogs](https://pnpm.io/catalogs) feature to ensure that dependencies are in sync between different packages in monorepo.
- aa1c7597: Added new attributes to OTEL setup - it will allow better GitHub integration with our OTEL provider
- Updated dependencies [996d9be1]
- Updated dependencies [aa1c7597]
  - @saleor/react-hook-form-macaw@0.2.13
  - @saleor/webhook-utils@0.2.4
  - @saleor/apps-logger@1.5.1
  - @saleor/apps-shared@1.12.1
  - @saleor/apps-otel@2.1.1
  - @saleor/apps-ui@1.2.11
  - @saleor/sentry-utils@0.2.4

## 2.1.1

### Patch Changes

- 8154e9e9: Use `AwsInstrumentation` to auto instrument DynamoDB calls
- Updated dependencies [8154e9e9]
  - @saleor/apps-otel@2.1.0

## 2.1.0

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

## 2.0.7

### Patch Changes

- b3e136b0: Add `saleor-app` prefix to `package.json` so names of npm app projects are in sync with names of Vercel projects. No visible changes to the user.

## 2.0.6

### Patch Changes

- 5cf7d541: Set Vercel function memory allocation to 256 MB and max duration to 15 seconds.
- fd3bb012: Added logger context and OTEL wrappers to tRPC API routes with Sentry support. After this change 5xx errors will be send to Sentry and we will see tRPC related endpoints in OTEL.

## 2.0.5

### Patch Changes

- 2f06b1e9: Bumping app-sdk to v0.52.0 - adding native APL support for vercel-kv and redis
- a8f63fc4: Modified vercel.json to allow multiple regions. Now Vercel will replicate function in "dub1" and "iad1"
- 99f64efc: - Fixed bug in webhook migration script that was causing app webhooks to be disabled by migration
  - Awaited Segment flush event - after this change events will be properly send to Segment
  - Added user email to properties sent to Segment.

## 2.0.4

### Patch Changes

- 0f0bff21: Move `ThemeSynchronizer` utility to shared packages.
- 989cb683: - Changed what we sent to Segment to be in sync with their [spec](https://segment.com/docs/connections/spec/ecommerce/v2/)
  - Added new Saleor event - `OrderConfirmed` that will be mapped to Segment `OrderCompleted`
  - Removed Saleor event - `OrderCreated` - it didn't have respective Segment event

## 2.0.3

### Patch Changes

- b61ce914: Added DynamoDB APL. This APL is using DynamoDB as storage.
- 820f5b90: Cleanup Segment app - rename of files or fix naming.
- 36aea8d9: Store app config in DynamoDB instead of Saleor app metadata.

## 2.0.2

### Patch Changes

- 0db174a8: Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.

## 2.0.1

### Patch Changes

- Updated dependencies [9bbf9ee5]
- Updated dependencies [9bbf9ee5]
  - @saleor/apps-logger@1.4.3
  - @saleor/react-hook-form-macaw@0.2.12
  - @saleor/webhook-utils@0.2.3
  - @saleor/apps-shared@1.11.4
  - @saleor/apps-otel@1.3.5
  - @saleor/apps-ui@1.2.10

# saleor-app-segment

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

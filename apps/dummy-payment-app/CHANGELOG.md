# saleor-app-payment-dummy

## 1.3.2

### Patch Changes

- fa2a728: The app is now built with Turbopack instead of webpack, so builds and local development are faster. App behavior is unchanged.

## 1.3.1

### Patch Changes

- Updated dependencies [c1a728f]
- Updated dependencies [840a60d]
  - @saleor/apps-logger@1.6.9
  - @saleor/apps-shared@1.17.4
  - @saleor/stale-installations-cleanup@0.3.1

## 1.3.0

### Minor Changes

- cf92cf5: Stale installations cleanup now only removes data of installations on the Saleor Cloud it is configured for. Set `SALEOR_CLOUD_ROOT_DOMAINS` to that Cloud's root domains, comma separated, e.g. `saleor.cloud,eu.saleor.cloud`. Until it is set, the job doesn't run.

  Before, Saleor Cloud reported any environment it doesn't host as gone, so data of installations on another Saleor Cloud (e.g. staging), on self-hosted Saleor or on custom domains would have been removed. Now only installations at `<name>.<root domain>` are checked; everything else is kept and counted as `skipped` in the summary.

### Patch Changes

- Updated dependencies [cf92cf5]
- Updated dependencies [888f9ab]
  - @saleor/stale-installations-cleanup@0.3.0

## 1.2.1

### Patch Changes

- b08cb53: Stale installations cleanup logs now fit in Vercel's limit of 256 log lines per request. Before, it logged one line per stale installation, so with many of them the remaining installations and the final summary were dropped from the logs. Now it logs the summary (`checked`, `unknown`, `stale`, `items`) first, then lists stale installations 100 per line, then the result.
- Updated dependencies [b08cb53]
  - @saleor/stale-installations-cleanup@0.2.0

## 1.2.0

### Minor Changes

- c94bfe4: The app now cleans up after deleted Saleor Cloud environments. A daily job asks Saleor Cloud which environments the app is installed in still exist, by their Saleor Cloud or custom domain, and removes everything the app stored for those that are gone. Before, data of deleted environments stayed in the app's database indefinitely.

  The job only runs once `CRON_SECRET`, `SALEOR_CLOUD_API_URL` and `SALEOR_CLOUD_OIDC_AUDIENCE` are set. It starts in dry-run mode, logging what it would remove; set `STALE_INSTALLATIONS_CLEANUP_DRY_RUN=false` to delete.

### Patch Changes

- 88e026b: The app now refuses to start when a secret it sends in HTTP headers (`CRON_SECRET`, `UPSTASH_TOKEN`, `OTEL_ACCESS_TOKEN`) contains non-ASCII characters, and the error names the variable. Before, the app started normally and then the requests using that secret failed at runtime. If one of these secrets has accented or other non-ASCII letters, replace it.
- Updated dependencies [c94bfe4]
  - @saleor/stale-installations-cleanup@0.1.0

## 1.1.14

### Patch Changes

- 4cff73c: Updated Macaw UI to v3. Configuration screens keep the same layout and behavior; dialogs, dropdowns, tooltips and popovers now run on newer versions of their underlying components.

## 1.1.13

### Patch Changes

- 7783337: Upgraded next.js v16.4.1

## 1.1.12

### Patch Changes

- Updated dependencies [ab5a656]
  - @saleor/apps-logger@1.6.8
  - @saleor/apps-shared@1.17.3

## 1.1.11

### Patch Changes

- 14691bc: Upgraded neverthrow from v6.2.1 to v8.1.1 and zod from v3.21.4 to v3.24.1. App behavior doesn't change.

## 1.1.10

### Patch Changes

- a2fbe4a: Upgraded Next.js from v15.5.27 to v16.3.8. Apps keep building with Webpack for now; the switch to Turbopack will ship separately.

## 1.1.9

### Patch Changes

- 60f11e2: Upgrade next.js to 16.3.8 or 15.5.27

## 1.1.8

### Patch Changes

- 635e29e: Upgraded Sentry SDK to v10. Previously, Sentry context (breadcrumbs, tags, user) could leak between concurrent requests handled by the same server instance. Now each request gets its own isolated Sentry scope, so error reports only contain data from the request that failed.

  Sentry no longer wraps API route handlers. Previously, this wrapper stopped OpenTelemetry from recording spans created inside handlers. Now those spans appear in traces again. Errors from API routes are still reported to Sentry.

- abdba39: Fixed OpenTelemetry spans that could go missing when a route was loaded before instrumentation was registered. Previously, tracers created at module load (e.g. DynamoDB APL) could stay silent; now they share the same OpenTelemetry instance as instrumentation and always record spans. This also prepares the apps for the Next.js 16 upgrade, where this load order happens on Vercel.
- Updated dependencies [4c5c512]
  - @saleor/apps-logger@1.6.7
  - @saleor/apps-shared@1.17.2

## 1.1.7

### Patch Changes

- ce36410: Upgraded Next.js to v15.5.26
- Updated dependencies [c12c623]
  - @saleor/apps-shared@1.17.1

## 1.1.6

### Patch Changes

- Updated dependencies [831f396]
  - @saleor/apps-shared@1.17.0

## 1.1.5

### Patch Changes

- Updated dependencies [9c585ac]
  - @saleor/apps-otel@2.4.2
  - @saleor/apps-logger@1.6.6
  - @saleor/apps-shared@1.16.2

## 1.1.4

### Patch Changes

- Updated dependencies [53fa836]
  - @saleor/apps-logger@1.6.5
  - @saleor/apps-shared@1.16.1

## 1.1.3

### Patch Changes

- 40321e5: Apps now identify themselves when they call the Saleor GraphQL API. Before, requests
  went out with the runtime's default `User-Agent`, so it was impossible to tell from
  Saleor's access logs which app produced them. Now every server-side request carries
  `User-Agent: <app-package-name>/<app-version>`, e.g. `saleor-app-avatax/3.1.0`.
- Updated dependencies [40321e5]
  - @saleor/apps-shared@1.16.0

## 1.1.2

### Patch Changes

- Updated dependencies [d78dcb0]
  - @saleor/apps-shared@1.15.0

## 1.1.1

### Patch Changes

- 546b559: Updated Macaw UI to v2. Icons that used to come from Macaw UI (close, trash, edit, chevrons, arrows, copy, external link, and others) now come from Lucide, so a few icons look slightly different but keep the same meaning and placement.

## 1.1.0

### Minor Changes

- 0cfd65b: The Quick checkout testing page now lets you build the checkout from multiple lines instead of a single hardcoded product. For each line you can pick a product and quantity, and enable a "Custom price" option that reveals price and reason inputs. Both values are sent to Saleor as the line's `price` and `priceOverrideReason`, and the created checkout echoes them back so you can verify the override. Setting a custom price requires the app's new `HANDLE_CHECKOUTS` permission (re-install the app to grant it). While any request is in flight (loading products, creating the checkout, setting delivery, etc.) the page's controls are disabled and a busy cursor is shown, so overlapping operations can't be triggered.
- 0cfd65b: When a checkout line uses a price override, the Quick checkout page now runs `checkoutCreate` on the app's backend instead of directly from the browser. This lets the Saleor operation be logged server-side — gated behind the new `LOG_SALEOR_OPERATIONS` env flag, so nothing is logged in production — and forwards any Saleor error (for example a missing `HANDLE_CHECKOUTS` permission) back to the UI, where it is now shown instead of failing silently. Checkouts without a price override keep using the existing client-side flow.

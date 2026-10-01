# saleor-app-payment-dummy

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

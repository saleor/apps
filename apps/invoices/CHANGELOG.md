# saleor-app-invoices

## 1.7.1

### Patch Changes

- 2755ed2: Added extra padding on top of the app so it has some space between content and dashboard header

## 1.7.0

### Minor Changes

- 55c8f1a: App now validates Saleor version and will fail if lower than 3.10
- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

### Patch Changes

- 2d23480: Add homepage and support url to manifest
- Updated dependencies [2d23480]
  - @saleor/apps-shared@1.3.0

## 1.6.0

### Minor Changes

- 289b42f: Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own.
  Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md

### Patch Changes

- 4e4257d: Ensure initially selected channel will not crash if no channels exist

## 1.5.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable
- 5fc88ed: Add shared theme provider with color overrides and globals

### Patch Changes

- b3178b2: Improve UI - better styling, headers
- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

## 1.4.0

### Minor Changes

- b874d10: Add logging error in SaleorAsyncWebhook

### Patch Changes

- b874d10: Update @saleor/app-sdk to 0.29.0
- Updated dependencies [648d99b]
  - @saleor/apps-shared@1.1.1

## 1.3.0

### Minor Changes

- c1dab0b: Unsticky app cards and change loader type

## 1.2.0

### Minor Changes

- 0219561: Remove firstName and lastName fields in billing address of a company

## 1.1.3

### Patch Changes

- 9f843b2: Update imports to @saleor/apps-shared
- 9f843b2: Remove generated folders form git history
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
  - @saleor/apps-shared@1.1.0

## 1.1.2

### Patch Changes

- a641caf: Extract isInIframe to new shared package and use it in apps
- a641caf: Update deps and disable SSR mode in trpc
- Updated dependencies [a641caf]
  - @saleor/apps-shared@1.0.1

## 1.1.1

### Patch Changes

- 21f0a60: Link local eslint config to package json

## 1.1.0

### Minor Changes

- 569a187: Remove VercelAPL from SaleorApp

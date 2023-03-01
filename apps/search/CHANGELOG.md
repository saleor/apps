# saleor-app-search

## 1.3.0

### Minor Changes

- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

### Patch Changes

- Updated dependencies [2d23480]
  - @saleor/apps-shared@1.3.0

## 1.2.0

### Minor Changes

- 289b42f: Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own.
  Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md

## 1.1.0

### Minor Changes

- 1c9b2c4: Change public app names to be more readable
- 5fc88ed: Add shared theme provider with color overrides and globals
- ea850d3: Remove unused preview features and make CSS better

### Patch Changes

- Updated dependencies [5fc88ed]
  - @saleor/apps-shared@1.2.0

## 1.0.3

### Patch Changes

- b874d10: Update @saleor/app-sdk to 0.29.0
- c786483: Subscription queries for webhooks has been splitted to pass a new validation
- Updated dependencies [648d99b]
  - @saleor/apps-shared@1.1.1

## 1.0.2

### Patch Changes

- ce17e45: Fix missing attribute values in products

## 1.0.1

### Patch Changes

- 9f843b2: Update imports to @saleor/apps-shared
- 9f843b2: Use TitleBar and AppIcon from shared package
- 9f843b2: Remove generated folders form git history
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
- Updated dependencies [9f843b2]
  - @saleor/apps-shared@1.1.0

## 1.0.0

### Major Changes

- 21f0a60: Include Search app to apps

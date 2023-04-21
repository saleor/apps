# @saleor/apps-shared

## 1.4.0

### Minor Changes

- 2e51890: Added useDashboardNotification hook, that allows quick access to AppBridge.dispatch(Notification())

### Patch Changes

- 2c0df91: Added lint:fix script, so `eslint --fix` can be run deliberately
- e167e72: Update next.js to 13.3.0
- 74174c4: Updated @saleor/app-sdk to 0.37.3
- 2e51890: Update next.js to 13.3.0
- 2e51890: Update @saleor/app-sdk to 0.37.2

## 1.3.0

### Minor Changes

- 2d23480: Remove TitleBar component from apps, because it is moved to Dashboard, outside of iframe context

## 1.2.0

### Minor Changes

- 5fc88ed: Add shared theme provider with color overrides and globals

## 1.1.1

### Patch Changes

- 648d99b: Remove not needed console log

## 1.1.0

### Minor Changes

- 9f843b2: Add main-bar and app-icon
- 9f843b2: Make TitleBar sticky to the top
- 9f843b2: Allow icon, text and theme to AppIcon
- 9f843b2: Add root index file

### Patch Changes

- 9f843b2: Remove generated folders form git history

## 1.0.1

### Patch Changes

- a641caf: Extract isInIframe to new shared package and use it in apps

# @saleor/apps-ui

## 1.1.2

### Patch Changes

- f96563f: Fixed a missing text-decoration on a breadcrumb link.
- 860bac4: Updated @saleor/app-sdk to 0.40.1
- cb6ee29: Updated dependencies

## 1.1.1

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Set exact app-sdk version
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo
- 928c727: Updated @saleor/macaw-ui to 0.8.0-pre.95. This version introduces change in spacing scale, so there may be slight changes in spacing

## 1.1.0

### Minor Changes

- 24615cf: Added SemanticChip component that wraps MacawUI Chip with semantic variants: error, warning, success & default
- ba7c3de: Adds shared Breadcrumbs component. Each breadcrumbs item can be rendered with or without the href. The last item is automatically rendered without the href and with distinct styles.
- e751459: Added TextLink component that can work with Next router and AppBridge.dispatch

### Patch Changes

- f9ca488: Fixed TextLink color and style

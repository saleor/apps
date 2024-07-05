# eslint-config-saleor

## 0.4.10

### Patch Changes

- 17077505: Updated TypeScript version to 4.5.4.

## 0.4.9

### Patch Changes

- 37ecb246: Update pnpm to 9.2.0 version. It means that we also dropped support for Node.js less than 16.
- c4dcb863: Add createLogger rule. Right now we don't allow imports from @saleor/apps-logger directly. Use your app logger instead to create logger instance.

## 0.4.8

### Patch Changes

- 64d88b24: Update packages to ESM. See node [docs](https://nodejs.org/api/esm.html) for more info.
- 5cbd3b63: Updated @saleor/app-sdk package to 0.50.1

## 0.4.7

### Patch Changes

- 2604ce1e: Updated Next.js to 14.2.3

## 0.4.6

### Patch Changes

- 29d10d4a: Update Next.js to version 14.1.0.

## 0.4.5

### Patch Changes

- 261957f: Updated dependencies: vite, vitest, eslint, prettier, dotenv, turbo, syncpack, changesets, lint staged

## 0.4.4

### Patch Changes

- e7c2d3a: Updated and ESLint dependencies

## 0.4.3

### Patch Changes

- 2d77bca: Updated Next.js to 13.4.8

## 0.4.2

### Patch Changes

- cb6ee29: Updated dependencies

## 0.4.1

### Patch Changes

- a8834a1: Unified graphql version to 16.6
- a8834a1: Unified graphql codegen packages
- a8834a1: Removed unnecessary duplicated dependencies from apps and moved them to shared and root (types, eslint rules)
- a8834a1: Updated dev dependencies - Typescript, Eslint and Turborepo

## 0.4.0

### Minor Changes

- 453baf7: Added new warn rules to eslint-config-saleor: `newline-after-var` and `multiline-comment-style`.

### Patch Changes

- e167e72: Update next.js to 13.3.0
- 74174c4: Updated @saleor/app-sdk to 0.37.3
- 2e51890: Update next.js to 13.3.0
- 2e51890: Update @saleor/app-sdk to 0.37.2

## 0.3.0

### Minor Changes

- eca52ad: Added "no-default-export" eslint rule (except Next.js page)

### Patch Changes

- eca52ad: Replace "export default" with named exports

## 0.2.1

### Patch Changes

- 749941a: Update dependencies to fix config, so ESLint should work in Jetbrains IDE

## 0.2.0

### Minor Changes

- d13ece4: Disable next/babel setting in shared eslint config

## 0.1.0

### Minor Changes

- 7aabcdc: Update dependencies

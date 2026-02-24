---
name: create-saleor-package
description: Scaffold a new shared package in the saleor-apps monorepo under ./packages/. Use when asked to "create a package", "add a new package", "scaffold a package", "new shared library", or any task that involves creating a new reusable package in the saleor-apps monorepo. Handles all boilerplate - package.json, tsconfig, eslint, vitest, turbo, lint-staged configs, and src/index.ts.
---

# Create Saleor Package

Scaffold a new package in `packages/` with all standard monorepo boilerplate.

## Workflow

1. **Get the package name** - If not provided, ask the user. Need two values:
   - **Directory name**: kebab-case folder name under `packages/` (e.g. `my-utils`)
   - **npm name**: Scoped package name (e.g. `@saleor/my-utils`). Default: `@saleor/<directory-name>`

2. **Run the scaffold script**:
   ```bash
   bash .claude/skills/create-saleor-package/scripts/scaffold.sh <dir-name> <npm-name>
   ```

3. **Run `pnpm install`** from the monorepo root to link the new package into the workspace.

4. **Add subpath exports** if the user requested specific modules. Update `package.json` exports:
   ```json
   "exports": {
     "./module-name": {
       "import": "./src/module-name.ts",
       "types": "./src/module-name.ts"
     }
   }
   ```
   Create corresponding `src/module-name.ts` files.

5. **Add runtime dependencies** to `package.json` if needed. Use `catalog:` for versions managed in `pnpm-workspace.yaml`, or `workspace:*` for internal packages.

## What the Script Creates

| File | Purpose |
|------|---------|
| `package.json` | `type: module`, scripts (check-types, lint, test), devDeps for eslint/ts/vitest |
| `tsconfig.json` | Extends `@saleor/typescript-config-apps/base.json` |
| `eslint.config.js` | Flat config extending `@saleor/eslint-config-apps` |
| `vitest.config.ts` | jsdom environment, css disabled, shuffle enabled |
| `turbo.json` | Extends root turbo config |
| `lint-staged.config.js` | Extends root + eslint/prettier for JS/TS |
| `CHANGELOG.md` | Empty changelog for changesets |
| `src/index.ts` | Entry point with `export {}` placeholder |

## Naming Conventions

Existing packages use two patterns:
- `@saleor/apps-<name>` for core shared packages (logger, otel, shared, trpc, ui, domain)
- `@saleor/<name>` for standalone utilities (errors, webhook-utils, sentry-utils)

Follow the user's preference. When unclear, use `@saleor/<dir-name>`.

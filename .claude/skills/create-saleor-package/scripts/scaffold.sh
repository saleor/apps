#!/usr/bin/env bash
set -euo pipefail

# Scaffold a new Saleor Apps monorepo package
# Usage: scaffold.sh <package-dir-name> [npm-package-name]
#
# Example: scaffold.sh my-utils @saleor/my-utils

PACKAGE_DIR_NAME="${1:?Usage: scaffold.sh <package-dir-name> [npm-package-name]}"
NPM_NAME="${2:-@saleor/${PACKAGE_DIR_NAME}}"

# Find monorepo root (where pnpm-workspace.yaml lives)
MONOREPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
PACKAGE_PATH="${MONOREPO_ROOT}/packages/${PACKAGE_DIR_NAME}"

if [ -d "$PACKAGE_PATH" ]; then
  echo "ERROR: Directory already exists: ${PACKAGE_PATH}" >&2
  exit 1
fi

echo "Creating package: ${NPM_NAME}"
echo "  Directory: ${PACKAGE_PATH}"

mkdir -p "${PACKAGE_PATH}/src"

# --- package.json ---
cat > "${PACKAGE_PATH}/package.json" << ENDJSON
{
  "name": "${NPM_NAME}",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  },
  "scripts": {
    "check-types": "tsc",
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  },
  "devDependencies": {
    "@saleor/eslint-config-apps": "workspace:*",
    "@saleor/typescript-config-apps": "workspace:*",
    "@vitest/coverage-v8": "catalog:",
    "eslint": "catalog:",
    "typescript": "catalog:",
    "vite": "catalog:",
    "vitest": "catalog:"
  }
}
ENDJSON

# --- tsconfig.json ---
cat > "${PACKAGE_PATH}/tsconfig.json" << 'ENDJSON'
{
  "extends": "@saleor/typescript-config-apps/base.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
ENDJSON

# --- eslint.config.js ---
cat > "${PACKAGE_PATH}/eslint.config.js" << 'ENDJS'
import { config } from "@saleor/eslint-config-apps/index.js";

/** @type {import("eslint").Linter.Config} */
export default [...config];
ENDJS

# --- vitest.config.ts ---
cat > "${PACKAGE_PATH}/vitest.config.ts" << 'ENDTS'
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    environment: "jsdom",
    css: false,
    sequence: {
      shuffle: true,
    },
  },
});
ENDTS

# --- turbo.json ---
cat > "${PACKAGE_PATH}/turbo.json" << 'ENDJSON'
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {}
}
ENDJSON

# --- lint-staged.config.js ---
cat > "${PACKAGE_PATH}/lint-staged.config.js" << 'ENDJS'
import baseConfig from "../../lint-staged.config.js";

export default {
  ...baseConfig,
  "*.{jsx,tsx,ts,js}": ["eslint --cache --fix", "prettier --write"],
};
ENDJS

# --- CHANGELOG.md ---
cat > "${PACKAGE_PATH}/CHANGELOG.md" << ENDMD
# ${NPM_NAME}
ENDMD

# --- src/index.ts ---
cat > "${PACKAGE_PATH}/src/index.ts" << 'ENDTS'
export {};
ENDTS

echo ""
echo "Package scaffolded at: ${PACKAGE_PATH}"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm install' from the monorepo root to link the package"
echo "  2. Add dependencies to package.json as needed"
echo "  3. Export modules from src/index.ts"

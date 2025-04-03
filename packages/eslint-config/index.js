import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import saleorPlugin from "@saleor/eslint-plugin-saleor-app";
import stylisticPlugin from "@stylistic/eslint-plugin";
import vitestPlugin from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export const config = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: "@saleor/eslint-config-apps/ignores",
    ignores: [".next/**/*", "coverage/**/*", "**/generated/**/*", "next-env.d.ts"],
  },
  {
    name: "@saleor/eslint-config-apps/code-ts",
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      turbo: turboPlugin,
      import: importPlugin,
      "simple-import-sort": simpleImportSortPlugin,
      "@next/next": nextPlugin,
      "@stylistic": stylisticPlugin,
      "@saleor/saleor-app": saleorPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...tseslint.configs.eslintRecommended.rules,
      "max-params": "off",
      "@typescript-eslint/max-params": ["error", { max: 3 }],
      "turbo/no-undeclared-env-vars": "error",
      "import/order": "off", // to avoid conflicts with simple-import-sort
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-default-export": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@next/next/no-html-link-for-pages": "off",
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "directive", next: "*" },
        { blankLine: "any", prev: "directive", next: "directive" },
        { blankLine: "always", prev: ["case", "default"], next: "*" },
      ],
      "multiline-comment-style": ["error", "starred-block"],
      "no-console": "error",
      "@saleor/saleor-app/logger-leak": "error",
      // based on https://typescript-eslint.io/rules/no-unused-vars/#what-benefits-does-this-rule-have-over-typescript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    name: "@saleor/eslint-config-apps/code-tsx",
    files: ["**/*.tsx"],
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "18.2.0",
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-key": "off",
    },
  },
  {
    name: "@saleor/eslint-config-apps/code-js",
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    name: "@saleor/eslint-config-apps/tests",
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    plugins: {
      vitest: vitestPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      "vitest/prefer-strict-equal": "error",
      "vitest/prefer-vi-mocked": "error",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/__tests__/**"],
              message: "Tests related code cannot be imported into application code",
            },
          ],
        },
      ],
    },
  },
  {
    name: "@saleor/eslint-config-apps/override-no-default-export",
    files: [
      "src/pages/**/*",
      "src/pages/api/**/*",
      "src/app/global-error.tsx",
      "**/*.config.{ts,js}",
      "**/vitest.workspace.ts",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    name: "@saleor/eslint-config-apps/override-no-restricted-imports",
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  // it has to be the last config as it overrides rules that conflicts with prettier
  eslintConfigPrettier,
];

import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-cms/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-cms/override-no-process-env",
    files: ["next.config.ts", "src/env.ts", "src/instrumentation.ts", "src/instrumentations/*"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-cms/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "no-fallthrough": "warn",
    },
  },
  {
    // TODO: remove this override once we rename all graphql files to kebab-case
    name: "saleor-app-cms/override-@graphql-eslint/match-document-filename",
    files: ["**/*.graphql"],
    rules: {
      "@graphql-eslint/match-document-filename": [
        "warn",
        {
          fileExtension: ".graphql",
          fragment: { style: "kebab-case" },
          query: { style: "kebab-case" },
          subscription: { style: "kebab-case" },
          mutation: { style: "kebab-case" },
        },
      ],
    },
  },
];

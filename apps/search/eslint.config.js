import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-search/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-search/override-no-process-env",
    files: ["next.config.ts", "src/env.ts", "src/instrumentation.ts", "src/instrumentations/*"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-search/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  {
    // TODO: remove this override once we rename all ts / tsx files to kebab-case
    name: "saleor-app-search/override-react-naming-convention/filename",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react-naming-convention/filename": ["warn", { rule: "kebab-case" }],
    },
  },
  {
    // TODO: remove this override once we rename all graphql files to kebab-case
    name: "saleor-app-search/override-@graphql-eslint/match-document-filename",
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

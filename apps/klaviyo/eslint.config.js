import { config } from "@saleor/eslint-config-apps/index.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-klaviyo/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-constant-binary-expression": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
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

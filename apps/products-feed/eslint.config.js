import { config } from "@saleor/eslint-config-apps/index.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-products-feed/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-empty": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  {
    // TODO: remove this override once we rename all graphql files to kebab-case
    name: "saleor-app-smtp/override-@graphql-eslint/match-document-filename",
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

import { config } from "@saleor/eslint-config-apps/index.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "@saleor/apps-ui/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
];

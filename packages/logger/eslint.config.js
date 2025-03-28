import { config } from "@saleor/eslint-config-apps/index.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "@saleor/apps-logger/overrides",
    files: ["**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "@saleor/apps-logger/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-fallthrough": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
    },
  },
];

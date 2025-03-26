import { config } from "@saleor/eslint-config-apps/index.js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "@saleor/sentry-utils/overrides",
    files: ["**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];

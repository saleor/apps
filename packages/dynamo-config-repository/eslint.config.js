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
];

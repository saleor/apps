import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-shipping-dummy/custom-config",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-shipping-dummy/override-no-process-env",
    files: ["src/env.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
];

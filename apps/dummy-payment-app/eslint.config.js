import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-payment-dummy/custom-config",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-payment-dummy/override-no-process-env",
    files: ["next.config.ts", "src/env.ts", "src/instrumentation.ts", "src/__tests__/setup.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
];

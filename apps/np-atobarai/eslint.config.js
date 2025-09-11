import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-payment-np-atobarai/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-payment-np-atobarai/override-no-process-env",
    files: ["next.config.ts", "src/lib/env.ts", "src/__tests__/setup.ts", "src/instrumentation.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
];

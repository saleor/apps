import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["src/graphql-env.d.ts", "src/graphql-cache.d.ts"],
  },
  {
    name: "saleor-payment-apps-testclient/custom-config",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-payment-apps-testclient/override-no-process-env",
    files: ["next.config.ts", "src/env.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    name: "saleor-payment-apps-testclient/router-default-exports",
    files: ["src/app/**/*"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];

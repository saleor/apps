import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-payment-stripe/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-payment-stripe/override-no-process-env",
    files: [
      "next.config.ts",
      "src/lib/env.ts",
      "src/instrumentation.ts",
      "*.test.ts",
      "src/__tests__/**",
      "e2e/**",
    ],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    name: "saleor-app-payment-stripe/override-turbo-env-requirement",
    files: ["src/__tests__/**", "*.test.ts", "e2e/**"],
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
  {
    name: "saleor-app-payment-stripe/allow-console-in-tests",
    files: ["src/__tests__/**", "*.test.ts"],
    rules: {
      "no-console": "off",
    },
  },
];

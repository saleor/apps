import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-shopify-sync/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-shopify-sync/override-no-process-env",
    files: [
      "next.config.ts",
      "src/lib/env.ts",
      "scripts/**/*.ts",
    ],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    name: "saleor-app-shopify-sync/override-turbo-env-requirement",
    files: ["src/__tests__/**", "*.test.ts"],
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
  {
    name: "saleor-app-shopify-sync/allow-console-in-tests",
    files: ["src/__tests__/**", "*.test.ts", "scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];

import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-klaviyo/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-klaviyo/override-no-process-env",
    files: ["next.config.ts", "src/env*.ts", "src/instrumentations/*", "src/instrumentation.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-klaviyo/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-constant-binary-expression": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    },
  },
];

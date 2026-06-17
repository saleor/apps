import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-anonymizer/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-anonymizer/override-no-process-env",
    files: ["next.config.ts", "src/env.ts", "src/instrumentation.ts", "src/instrumentations/*.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-anonymizer/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-fallthrough": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
];

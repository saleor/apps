import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-onboarding/custom-config",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
    },
  },
  {
    name: "saleor-app-onboarding/override-no-process-env",
    files: ["next.config.ts", "src/lib/env.ts", "src/instrumentation.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  {
    name: "saleor-app-onboarding/app-router-default-exports",
    files: ["src/app/**/*"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];

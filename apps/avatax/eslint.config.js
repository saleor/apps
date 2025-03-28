import { config } from "@saleor/eslint-config-apps/index.js";
import nodePlugin from "eslint-plugin-n";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    name: "saleor-app-avatax/custom-config",
    files: ["**/*.ts"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-env": "error",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@opentelemetry/api",
              importNames: ["trace"],
              message:
                "Importing trace from @opentelemetry/api is not allowed. Use `@lib/tracing` module instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // TODO: remove this override once the recommended rules are fixed
    name: "saleor-app-avatax/override-recommended",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-type-constraint": "warn",
      "no-fallthrough": "warn",
    },
  },
  {
    name: "saleor-app-avatax/override-no-process-env",
    files: ["next.config.ts", "src/env.ts", "src/instrumentation.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
];

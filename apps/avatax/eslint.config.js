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
                "Importing trace from @opentelemetry/api is not allowed. Use our custom tracing module instead.",
            },
          ],
        },
      ],
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

/* eslint-disable import/no-default-export */
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "react",
      exclude: ["integration/**/*.spec.ts"],
    },
  },
  {
    test: {
      include: ["integration/**/*.spec.ts"],
      setupFiles: ["./integration/setup.ts"],
      name: "integration",
      environment: "node",
      /*
       * Use a default 20s timeout for tests
       * This is a timeout for sync webhooks in Saleor
       */
      testTimeout: 20_000,
    },
  },
]);

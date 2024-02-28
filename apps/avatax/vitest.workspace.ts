/* eslint-disable import/no-default-export */
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "react",
      exclude: ["e2e/**/*.spec.ts"],
    },
  },
  {
    test: {
      include: ["e2e/**/*.spec.ts"],
      setupFiles: ["./e2e/setup.ts"],
      name: "integration",
      environment: "node",
      /*
       * Use a default 60s timeout for tests
       * Each request has a timeout of 20s, and can be retried up to 3 times
       */
      testTimeout: 60_000,
      /*
       * Request retries are done by PactumJS
       * Making a retry in vitest would cause issues with e2e utility
       * It would mark the test as successful even if it failed
       */
      retry: 0,
    },
  },
]);

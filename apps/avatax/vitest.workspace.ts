/* eslint-disable import/no-default-export */
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "units",
      exclude: ["e2e/**/*.spec.ts"],
    },
  },
  {
    test: {
      include: ["e2e/**/*.spec.ts"],
      setupFiles: ["./e2e/setup.ts"],
      name: "e2e",
      environment: "node",
      /*
       * Use a default 63s timeout for tests
       * Each request has a timeout of 21s, and can be retried up to 3 times
       * 20s is a timeout of sync webhooks in Saleor, we add additional buffer on top of that
       */
      testTimeout: 63_000,
      /*
       * Request retries are done by PactumJS
       * Making a retry in vitest would cause issues with e2e utility
       * It would mark the test as successful even if it failed
       */
      retry: 0,
    },
  },
]);

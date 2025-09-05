import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    workspace: [
      {
        extends: true,
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
    ],
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
  },
});

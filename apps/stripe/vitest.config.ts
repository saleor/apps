import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    css: false,
    mockReset: true,
    restoreMocks: true,
    workspace: [
      {
        extends: true,
        test: {
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"], // exclude integration tests so vitest doesn't run them twice
          name: "unit",
          setupFiles: "./src/__tests__/setup.units.ts",
        },
      },
      {
        extends: true,
        test: {
          include: ["src/**/*.integration.test.{ts,tsx}"],
          name: "integration",
          setupFiles: "./src/__tests__/setup.integration.ts",
        },
      },
      {
        extends: true,
        test: {
          globalSetup: "./src/__tests__/global-setup.integration-dynamo.ts",
          include: ["src/__tests__/integration/dynamodb/**/*.test.{ts,ts}"],
          name: "integration:dynamodb",
          setupFiles: "./src/__tests__/setup.integration-dynamo.ts",
        },
      },
    ],
    sequence: {
      /**
       * Shuffle tests to avoid side effects, where test_2 relies on something that test_1 did.
       * Now tests will fail a little earlier
       */
      shuffle: true,
    },
  },
});

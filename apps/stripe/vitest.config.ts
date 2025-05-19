import * as path from "node:path";

import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    css: false,
    mockReset: true,
    restoreMocks: true,
    workspace: [
      {
        extends: true,
        test: {
          sequence: {
            shuffle: true,
          },
          include: ["src/**/*.test.ts"],
          exclude: ["src/__tests__/integration/**"], // exclude integration tests so vitest doesn't run them twice
          name: "unit",
          setupFiles: "./src/__tests__/setup.units.ts",
          environment: "jsdom",
        },
      },
      {
        extends: true,
        test: {
          sequence: {
            concurrent: false,
          },
          globalSetup: "./src/__tests__/integration/dynamodb/global-setup.integration-dynamo.ts",
          include: ["src/__tests__/integration/dynamodb/**/*.test.{ts,ts}"],
          name: "integration:dynamodb",
          setupFiles: "./src/__tests__/integration/dynamodb/setup.integration-dynamo.ts",
          env: loadEnv("", path.join(__dirname, "src/__tests__/integration/dynamodb"), ""),
        },
      },
    ],
  },
});

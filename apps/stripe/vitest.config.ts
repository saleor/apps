import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    passWithNoTests: true, // TODO: remove this after we add first test
    setupFiles: "./src/__tests__/setup.ts",
    css: false,
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
      "@/generated": new URL("./generated/", import.meta.url).pathname,
      "@/package.json": new URL("./package.json", import.meta.url).pathname,
    },
    workspace: [
      {
        extends: true,
        test: {
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"], // exclude integration tests so vitest doesn't run them twice
          name: "unit",
        },
      },
      {
        extends: true,
        test: {
          include: ["src/**/*.integration.test.{ts,tsx}"],
          name: "integration",
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

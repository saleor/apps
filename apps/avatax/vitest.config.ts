import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";

/*
 * This config is used for ui tests, for all configurations see vitest.workspace.ts
 * Docs:
 *
 * https://vitejs.dev/config/
 * https://vitest.dev/guide/workspace.html#defining-a-workspace
 */
export default defineProject({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
    sequence: {
      /**
       * Shuffle tests to avoid side effects, where test_2 relies on something that test_1 did.
       * Now tests will fail a little earlier
       */
      shuffle: true,
    },
  },
});

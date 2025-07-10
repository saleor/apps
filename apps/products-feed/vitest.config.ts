import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
    sequence: {
      /**
       * Shuffle tests to avoid side effects, where test_2 relies on something that test_1 did.
       * Now tests will fail a little earlier
       */
      shuffle: true,
    },
  },
});

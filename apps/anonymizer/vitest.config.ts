import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
      "@/generated": new URL("./generated/", import.meta.url).pathname,
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

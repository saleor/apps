import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    globalSetup: "./test-globals.ts",
  },
});

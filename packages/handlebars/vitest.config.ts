import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    environment: "jsdom",
    css: false,
    sequence: {
      shuffle: true,
    },
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    environment: "node",
    css: false,
    sequence: {
      shuffle: true,
    },
  },
});

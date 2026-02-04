import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
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

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    // Required by src/env.ts, which server modules import.
    env: { NEXT_PUBLIC_INITIAL_CHANNEL_SLUG: "default-channel" },
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },
});

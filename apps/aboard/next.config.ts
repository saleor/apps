import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
  outputFileTracingRoot: path.resolve("../.."),
  reactStrictMode: true,
  transpilePackages: ["@saleor/apps-shared"],
  bundlePagesRouterDependencies: true,
};

export default withSentryConfig(config, {
  silent: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

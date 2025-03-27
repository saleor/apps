import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@saleor/apps-shared",
    "@saleor/apps-otel",
    "@saleor/apps-logger",
    "@saleor/apps-ui",
    "@saleor/webhook-utils",
    "@saleor/react-hook-form-macaw",
  ],
  experimental: {
    optimizePackageImports: [
      "@sentry/nextjs",
      "@sentry/node",
      "@saleor/app-sdk",
      "@trpc/server",
      "@trpc/client",
      "@trpc/react-query",
      "@trpc/next",
      "@saleor/apps-shared",
    ],
  },
  bundlePagesRouterDependencies: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
      config.ignoreWarnings = [{ module: /require-in-the-middle/ }];
    }

    return config;
  },
};

// Make sure to export sentry config as the last one - https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#apply-instrumentation-to-your-app
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});

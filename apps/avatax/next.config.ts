/* eslint-disable import/no-default-export */
/* eslint-disable node/no-process-env */
import withBundleAnalyzerConfig from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// cache request for 1 day (in seconds) + revalidate once 60 seconds
const cacheValue = "private,s-maxage=60,stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/trpc/clientLogs.getByCheckoutOrOrderId",
        // Keys based on https://vercel.com/docs/edge-network/headers/cache-control-headers
        headers: [
          {
            key: "CDN-Cache-Control",
            value: cacheValue,
          },
          {
            key: "Cache-Control",
            value: cacheValue,
          },
        ],
      },
      {
        source: "/api/trpc/clientLogs.getByDate",
        headers: [
          {
            key: "CDN-Cache-Control",
            value: cacheValue,
          },
          {
            key: "Cache-Control",
            value: cacheValue,
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  transpilePackages: [
    "@saleor/apps-otel",
    "@saleor/apps-logger",
    "@saleor/apps-shared",
    "@saleor/apps-ui",
    "@saleor/react-hook-form-macaw",
  ],
  experimental: {
    optimizePackageImports: [
      "@sentry/nextjs",
      "@sentry/node",
      "usehooks-ts",
      "@saleor/app-sdk",
      "@trpc/server",
      "@trpc/client",
      "@trpc/react-query",
      "@trpc/next",
      "jotai",
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

const configWithSentry = withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
  },
  {
    hideSourceMaps: true,
    widenClientFileUpload: true,
    disableLogger: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
  },
);

const withBundleAnalyzer = withBundleAnalyzerConfig({
  enabled: process.env.ANALYZE_BUNDLE === "true",
});

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

const config = isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

// @ts-expect-error bundle analyzer requires NextConfig when Sentry is returning NextConfigFunction | NextConfigObject
export default withBundleAnalyzer(config);

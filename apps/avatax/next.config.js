// @ts-check

import withBundleAnalyzerConfig from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

// cache request for 1 day (in seconds) + revalidate once 60 seconds
const cacheValue = "private,s-maxage=60,stale-while-revalidate=86400";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    serverComponentsExternalPackages: [
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/lib-dynamodb",
      "@aws-sdk/util-dynamodb",
      // dependencies of aws-sdk-client-mock
      "@aws-sdk/client-s3",
      "@aws-sdk/client-sns",
      "@aws-sdk/client-sqs",
    ],
    bundlePagesExternals: true,
    instrumentationHook: true,
  },
  /** @type {import('next').NextConfig['webpack']} */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
      config.ignoreWarnings = [{ module: /require-in-the-middle/ }];
    }

    return config;
  },
};

const configWithBundleAnalyzer = withBundleAnalyzerConfig({
  enabled: process.env.ANALYZE_BUNDLE === "true",
})(nextConfig);

// Make sure to export sentry config as the last one - https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#apply-instrumentation-to-your-app
export default withSentryConfig(configWithBundleAnalyzer, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});

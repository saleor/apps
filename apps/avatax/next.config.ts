import withBundleAnalyzerConfig from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs/config";
import { type NextConfig } from "next";

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
    ],
  },
  bundlePagesRouterDependencies: true,
  serverExternalPackages: [
    /*
     * Share one @opentelemetry/api instance between instrumentation and routes. With a bundled
     * copy, tracers created at module load (e.g. app-sdk DynamoAPL) stay no-op when a route
     * loads before register(), which happens on Vercel since Next 16.
     */
    "@opentelemetry/api",
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/util-dynamodb",
    "dynamodb-toolbox",
  ],
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
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    // Sentry's API route wrapper stops @vercel/otel from recording spans when Sentry tracing is off. Errors are still captured via onRequestError (src/instrumentation.ts)
    autoInstrumentServerFunctions: false,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

const { withSentryConfig } = require("@sentry/nextjs");

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@saleor/apps-otel",
    "@saleor/apps-logger",
    "@saleor/apps-shared",
    "@saleor/apps-ui",
    "@saleor/react-hook-form-macaw",
  ],
};

const configWithSentry = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    hideSourceMaps: true,
    widenClientFileUpload: true,
    disableLogger: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
  },
);

const config = isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  enabled: process.env.ANALYZE_BUNDLE === "true",
});

module.exports = withBundleAnalyzer(config);

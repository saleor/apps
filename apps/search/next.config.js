const { withSentryConfig } = require("@sentry/nextjs");

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@saleor/apps-shared",
    "@saleor/apps-otel",
    "@saleor/apps-logger",
    "@saleor/apps-ui",
    "@saleor/webhook-utils",
    "@saleor/react-hook-form-macaw",
  ],
  /*
   * Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
   * Remove when https://github.com/open-telemetry/opentelemetry-js/pull/4660 is released
   */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    return config;
  },
};

const configWithSentry = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  },
);

module.exports = isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

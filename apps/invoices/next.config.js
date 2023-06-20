const { withSentryConfig } = require("@sentry/nextjs");

const isSentryPropertiesInEnvironment = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saleor/apps-shared", "@saleor/apps-ui", "@saleor/react-hook-form-macaw"],
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
  }
);


module.exports = isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;


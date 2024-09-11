// @ts-check

import { withSentryConfig } from "@sentry/nextjs";

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saleor/apps-shared", "nuvo-react"],
  experimental: {
    bundlePagesExternals: true
  },
  /*
   * Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
   * Remove when https://github.com/open-telemetry/opentelemetry-js/pull/4660 is released
   */
  /** @type {import('next').NextConfig['webpack']} */
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
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
  },
  {
    hideSourceMaps: true,
    widenClientFileUpload: true,
    disableLogger: true,
    tunnelRoute: "/monitoring",
  },
);

export default isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

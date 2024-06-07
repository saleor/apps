// @ts-check

import { getNextJsConfigWithSentry } from "@saleor/sentry-utils/nextjs/config";

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saleor/apps-shared", "nuvo-react", "@saleor/sentry-utils"],
  experimental: {
    instrumentationHook: true,
  },
  /*
   * Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
   * Remove when https://github.com/open-telemetry/opentelemetry-js/pull/4660 is released
   */
  /** @param { import("webpack").Configuration } config */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    return config;
  },
};

const configWithSentry = getNextJsConfigWithSentry({
  project: process.env.SENTRY_PROJECT,
  nextConfig,
});

export default isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

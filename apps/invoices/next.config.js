// @ts-check

import { getNextJsConfigWithSentry } from "@saleor/sentry-utils/nextjs/config";

const isSentryPropertiesInEnvironment = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG,
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@saleor/apps-shared",
    "@saleor/apps-ui",
    "@saleor/react-hook-form-macaw",
    "@saleor/trpc",
    "@saleor/sentry-utils",
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

const configWithSentry = getNextJsConfigWithSentry({
  project: process.env.SENTRY_PROJECT,
  nextConfig,
});

export default isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

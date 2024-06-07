// @ts-check

import { getNextJsConfigWithSentry } from "@saleor/sentry-utils/nextjs/config";

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
    "@saleor/sentry-utils",
  ],
  experimental: {
    instrumentationHook: true,
  },
};

const configWithSentry = getNextJsConfigWithSentry({
  project: process.env.SENTRY_PROJECT,
  nextConfig,
});

export default isSentryPropertiesInEnvironment ? configWithSentry : nextConfig;

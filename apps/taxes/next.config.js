// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require("@sentry/nextjs");

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ["@saleor/apps-shared"],
};

module.exports = withSentryConfig(
  config,
  { silent: true },
  {
    hideSourcemaps: true,
    disableServerWebpackPlugin: !isSentryPropertiesInEnvironment,
    disableClientWebpackPlugin: !isSentryPropertiesInEnvironment,
  }
);

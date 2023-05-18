const { z } = require("zod");

const RequiredEnvs = z.object({
  MAILCHIMP_CLIENT_ID: z.string().min(5),
  MAILCHIMP_CLIENT_SECRET: z.string().min(5),
});

/** @type {import('next').NextConfig} */
module.exports = () => {
  try {
    RequiredEnvs.parse(process.env);
  } catch (e) {
    console.error("🚫 Missing required env variables, see message below");
    console.error(e.issues);
    process.exit(1);
  }

  return {
    reactStrictMode: true,
    transpilePackages: ["@saleor/apps-shared"],
  };
};

const isSentryEnvAvailable =
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_AUTH_TOKEN;

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    /*
     * For all available options, see:
     * https://github.com/getsentry/sentry-webpack-plugin#options
     */

    // Suppresses source map uploading logs during build
    silent: true,

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    disableClientWebpackPlugin: !isSentryEnvAvailable,
    disableServerWebpackPlugin: !isSentryEnvAvailable,
    /*
     * For all available options, see:
     * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
     */

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);

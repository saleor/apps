const { z } = require("zod");
const { withSentryConfig } = require("@sentry/nextjs");

const RequiredEnvs = z.object({
  APL: z.string().min(1),
});

/** @type {import('next').NextConfig} */
const nextConfig = () => {
  try {
    RequiredEnvs.parse(process.env);
  } catch (e) {
    console.error("🚫 Missing required env variables, see message below");
    console.error(e.issues);
    process.exit(1);
  }

  return {
    reactStrictMode: true,
    // TODO Infer names dynamically from disk
    transpilePackages: ["@saleor/apps-shared", "@saleor/apps-ui", "@saleor/react-hook-form-macaw", "@saleor/trpc"],
  };
};

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

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

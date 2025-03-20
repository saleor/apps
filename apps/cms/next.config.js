/* eslint-disable no-console */
// @ts-check

import { withSentryConfig } from "@sentry/nextjs";
import { z } from "zod";

const RequiredEnvs = z.object({
  APL: z.string().min(1),
});

/** @type {import('next').NextConfig} */
const nextConfig = () => {
  const parsedEnvs = RequiredEnvs.safeParse(process.env);

  if (!parsedEnvs.success) {
    console.error("🚫 Missing required env variables, see message below");
    console.error(parsedEnvs.error.issues);
    process.exit(1);
  }

  return {
    reactStrictMode: true,
    transpilePackages: [
      "@saleor/apps-otel",
      "@saleor/apps-logger",
      "@saleor/apps-shared",
      "@saleor/apps-ui",
      "@saleor/react-hook-form-macaw",
    ],
    experimental: {
      optimizePackageImports: ["@sentry/nextjs", "@sentry/node"],
      bundlePagesExternals: true,
      instrumentationHook: true,
    },
    /** @type {import('next').NextConfig['webpack']} */
    webpack: (config, { isServer }) => {
      if (isServer) {
        // Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
        config.ignoreWarnings = [{ module: /require-in-the-middle/ }];
      }
      return config;
    },
  };
};

const isSentryPropertiesInEnvironment = process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

// Make sure to export sentry config as the last one - https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#apply-instrumentation-to-your-app
export default isSentryPropertiesInEnvironment
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      disableLogger: true,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
    })
  : nextConfig;

/* eslint-disable no-console */

import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";
import { z } from "zod";

const RequiredEnvs = z.object({
  APL: z.string().min(1),
});

const nextConfig = (): NextConfig => {
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
    },
    bundlePagesRouterDependencies: true,
    webpack: (config, { isServer }) => {
      if (isServer) {
        // Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
        config.ignoreWarnings = [{ module: /require-in-the-middle/ }];
      }
      return config;
    },
  };
};

// Make sure to export sentry config as the last one - https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#apply-instrumentation-to-your-app
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});

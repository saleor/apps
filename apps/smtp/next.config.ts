import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  serverExternalPackages: [
    /*
     * The deps below are have node-related features. When the flag "bundlePagesExternals" is enabled, They raise errors,
     * So we must explicitly declare them as externals.
     * more info: https://nextjs.org/docs/app/api-reference/next-config-js/serverExternalPackages
     */
    "handlebars",
    "handlebars-helpers",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
      config.ignoreWarnings = [{ module: /require-in-the-middle/ }, { module: /mjml/ }];
    }

    /*
     *html-minifier/uglify-js loading issue: https://github.com/mjmlio/mjml/issues/2132
     *Remove when mjml 5 is released: https://github.com/mjmlio/mjml/issues/2132#issuecomment-753010828
     */
    config.module.rules.push({
      test: /html-minifier/,
      use: "null-loader",
    });

    /*
     *When the flag "bundlePagesExternals" is enabled, handlebars cannot be properly loaded,
     *so we must explicitly declare what file we load.
     */
    config.resolve.alias.handlebars = "handlebars/dist/handlebars.js";

    return config;
  },
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

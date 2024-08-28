// @ts-check

import { withSentryConfig } from "@sentry/nextjs";

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
    "@saleor/react-hook-form-macaw"
  ],
  experimental: {
    serverComponentsExternalPackages: [
      /*
       * The deps below are have node-related features. When the flag "bundlePagesExternals" is enabled, They raise errors,
       * So we must explicitly declare them as externals. 
       * more info: https://nextjs.org/docs/app/api-reference/next-config-js/serverExternalPackages
       */
      "handlebars",
      "handlebars-helpers",
    ],
    bundlePagesExternals: true,
  },
  /*
   * Ignore opentelemetry warnings - https://github.com/open-telemetry/opentelemetry-js/issues/4173
   * Remove when https://github.com/open-telemetry/opentelemetry-js/pull/4660 is released
   */
  /** @type {import('next').NextConfig['webpack']} */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }, { module: /mjml/ }];
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

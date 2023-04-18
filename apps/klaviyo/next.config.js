/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");

const isSentryPropertiesInEnvironment =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT && process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  sentry: {
    disableServerWebpackPlugin: !isSentryPropertiesInEnvironment,
    disableClientWebpackPlugin: !isSentryPropertiesInEnvironment,
  },
  transpilePackages: ["@saleor/apps-shared"],
  redirects() {
    return [
      {
        source: "/",
        destination: "/configuration",
        permanent: false,
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  /*
   * Additional config options for the Sentry Webpack plugin. Keep in mind that
   * the following options are set automatically, and overriding them is not
   * recommended:
   *   release, url, org, project, authToken, configFile, stripPrefix,
   *   urlPrefix, include, ignore
   */

  silent: true, // Suppresses all logs
  /*
   * For all available options, see:
   * https://github.com/getsentry/sentry-webpack-plugin#options.
   */
};

/*
 * Make sure adding Sentry options is the last code to run before exporting, to
 * ensure that your source maps include changes from all other Webpack plugins
 */
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

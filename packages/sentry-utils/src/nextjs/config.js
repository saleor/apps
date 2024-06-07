// this file has to be in js format because of the nextjs config file is not parsed by Webpack, Babel or TypeScript.
import { withSentryConfig } from "@sentry/nextjs";

export const getNextJsConfigWithSentry = ({ project, nextConfig }) =>
  withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project,
    silent: true,
    hideSourceMaps: true,
    widenClientFileUpload: true,
    disableLogger: true,
    tunnelRoute: "/monitoring",
  });

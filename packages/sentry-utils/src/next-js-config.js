import { withSentryConfig } from "@sentry/nextjs";

export const getNextJsConfigWithSentry = ({ org, project, nextConfig }) =>
  withSentryConfig(nextConfig, {
    org,
    project,
    silent: true,
    hideSourceMaps: true,
    widenClientFileUpload: true,
    disableLogger: true,
    tunnelRoute: "/monitoring",
  });

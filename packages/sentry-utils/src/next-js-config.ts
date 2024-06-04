import { withSentryConfig } from "@sentry/nextjs";

export const getNextJsConfigWithSentry = <C>({
  org,
  project,
  nextConfig,
}: {
  org: string | undefined;
  project: string | undefined;
  nextConfig: C;
}) =>
  withSentryConfig(nextConfig, {
    org,
    project,
    silent: true,
    hideSourceMaps: true,
    widenClientFileUpload: true,
    disableLogger: true,
    tunnelRoute: "/monitoring",
  });

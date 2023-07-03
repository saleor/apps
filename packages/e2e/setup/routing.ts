import { configuration } from "./configuration";

export const appUrls = (appUrl: string) => ({
  manifest: new URL("/api/manifest", appUrl).href,
  register: new URL("/api/register", appUrl).href,
});

const saleorUrls = (dashboardUrl: string) => ({
  dashboard: {
    homepage: new URL("/dashboard", dashboardUrl).href,
    apps: new URL("/dashboard/apps", dashboardUrl).href,
    appInstallPage: (appManifest: string) =>
      new URL(`/dashboard/apps/install?manifestUrl=${appManifest}`, dashboardUrl).href,
  },
  api: new URL("/graphql/", dashboardUrl).href,
});

export const routing = {
  saleor: saleorUrls(configuration.instanceUrl),
};

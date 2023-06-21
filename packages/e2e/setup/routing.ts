import { configuration } from "./configuration";

export const appUrls = (appUrl: string) => ({
  manifest: new URL("/api/manifest", appUrl).href,
  register: new URL("/api/register", appUrl).href,
});

export const saleorUrls = (dashboardUrl: string) => ({
  dashboard: {
    homepage: new URL("/dashboard", dashboardUrl).href,
    apps: new URL("/dashboard/apps", dashboardUrl).href,
  },
  api: new URL("/graphql/", dashboardUrl).href,
});

export const routing = {
  app: {
    baseUrl: configuration.appUrl,
    ...appUrls(configuration.appUrl),
  },
  saleor: saleorUrls(configuration.instanceUrl),
};

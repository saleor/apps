/*
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";
import pkg from "./package.json";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableTracing: false,
  debug: false,

  integrations: [],
  environment: process.env.SENTRY_ENVIRONMENT,
  release: `saleor-app-${pkg.name}@${pkg.version}`,
});

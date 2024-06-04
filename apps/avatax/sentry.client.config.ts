/*
 * This file configures the initialization of Sentry on the browser.
 * The config you add here will be used whenever a page is visited.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import { initSentry } from "@saleor/sentry-utils";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

initSentry(SENTRY_DSN);

import { ALGOLIA_TIMEOUT_MS } from "./algolia-timeouts";

export const DYNAMODB_SLOW_THRESHOLD_MS = 1000;

/**
 * Algolia SDK treats its timeout per host. When request fails, it tries up to 3 different hosts in total.
 * Each request has separate timeout. So in total 3 * ALGOLIA_TIMEOUT_MS is max time. We want to get notified
 * if 2 subsequent requests start to fail, as this might cause timeouts in webhooks
 */
export const ALGOLIA_SLOW_THRESHOLD_MS = ALGOLIA_TIMEOUT_MS * 2;

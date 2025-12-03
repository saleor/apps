export const ALGOLIA_TIMEOUT_MS = process.env.ALGOLIA_TIMEOUT_MS
  ? parseInt(process.env.ALGOLIA_TIMEOUT_MS, 10)
  : 5000;

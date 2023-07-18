import { pRateLimit } from "p-ratelimit";

export const contentfulRateLimiter = pRateLimit({
  interval: 1000,
  rate: 2,
  concurrency: 2,
});

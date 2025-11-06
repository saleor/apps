// By default we cache the feed for 5 minutes. This can be changed by setting the FEED_CACHE_MAX_AGE
import { envCoercedNumber } from "@/lib/env-coerced-number";

export const FEED_CACHE_MAX_AGE = envCoercedNumber(60 * 5).parse(process.env.FEED_CACHE_MAX_AGE);

export const MAX_PARALLEL_CALLS = envCoercedNumber(5).parse(process.env.MAX_PARALLEL_CALLS);

export const VARIANTS_PER_PAGE = envCoercedNumber(50).parse(process.env.VARIANTS_PER_PAGE);

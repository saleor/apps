import { createLogger } from "@/lib/logger";
import { middleware, procedure } from "./trpc-server";

const logger = createLogger("publicProcedure");

const logErrors = middleware(async ({ next }) => {
  const result = await next();

  if (!result.ok) {
    logger.error(result.error.message, { error: result.error });
  }

  return result;
});

/**
 * Public procedure that doesn't require Saleor authentication
 * Used for endpoints that have their own authentication mechanism
 * (e.g., WSM admin endpoints with secret key authentication)
 */
export const publicProcedure = procedure.use(logErrors);

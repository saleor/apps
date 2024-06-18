import { createLogger } from "../../logger";
import { middleware } from "./trpc-server";

export const attachLogger = middleware(async ({ ctx, next, type, path }) => {
  const loggerName = `tRPC ${type} ${path.replace(/\./g, "/")}`;

  const logger = createLogger(loggerName, {
    requestType: type,
    path,
    saleorApiUrl: ctx.saleorApiUrl,
  });

  const start = Date.now();

  logger.debug(`Requested received`);

  const result = await next({
    ctx: {
      logger,
    },
  });
  const durationMs = Date.now() - start;

  if (result.ok) {
    logger.debug(`Response successful`, { durationMs });
  } else {
    logger.debug(`Response with error`, { durationMs });
  }

  return result;
});

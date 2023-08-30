import { router } from "../../trpc/trpc-server";

import { createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { AvataxClientLogger, logInputSchema } from "./avatax-client-logger";

const logProcedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
    },
  });
});

export const avataxClientLoggerRouter = router({
  push: logProcedure.input(logInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "avataxClientLoggerRouter.push",
    });

    logger.debug("Pushing log to metadata");

    const loggerRepository = new AvataxClientLogger({
      settingsManager: ctx.settingsManager,
    });

    return loggerRepository.push(input);
  }),
  getAll: logProcedure.query(async ({ ctx }) => {
    const logger = createLogger({
      name: "avataxClientLoggerRouter.getAll",
    });

    logger.debug("Getting logs from metadata");

    const loggerRepository = new AvataxClientLogger({
      settingsManager: ctx.settingsManager,
    });

    return loggerRepository.getAll();
  }),
});

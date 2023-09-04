import { router } from "../../trpc/trpc-server";

import { createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { AvataxClientLogger, logInputSchema } from "./avatax-client-logger";
import { z } from "zod";

const logProcedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
    },
  });
});

const logIdSchema = z.object({
  id: z.string(),
});

const pushLogInputSchema = z
  .object({
    log: logInputSchema,
  })
  .merge(logIdSchema);

export const avataxClientLoggerRouter = router({
  push: logProcedure.input(pushLogInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "avataxClientLoggerRouter.push",
    });

    logger.debug("Pushing log to metadata");

    const loggerRepository = new AvataxClientLogger({
      settingsManager: ctx.settingsManager,
      configurationId: input.id,
    });

    return loggerRepository.push(input.log);
  }),
  getAll: logProcedure.input(logIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "avataxClientLoggerRouter.getAll",
    });

    logger.debug("Getting logs from metadata");

    const loggerRepository = new AvataxClientLogger({
      settingsManager: ctx.settingsManager,
      configurationId: input.id,
    });

    return loggerRepository.getAll();
  }),
});

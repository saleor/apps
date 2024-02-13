import { createSettingsManager } from "../app/metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { ClientLogger, clientLogInputSchema } from "./client-logger";
import { z } from "zod";
import { router } from "../trpc/trpc-server";
import { createLogger } from "../../logger";

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

const pushClientLogInputSchema = z
  .object({
    log: clientLogInputSchema,
  })
  .merge(logIdSchema);

export const clientLoggerRouter = router({
  push: logProcedure.input(pushClientLogInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("ClientLoggerRouter.push");

    logger.debug("Pushing log to metadata");

    const loggerRepository = new ClientLogger({
      settingsManager: ctx.settingsManager,
      configurationId: input.id,
    });

    return loggerRepository.push(input.log);
  }),
  getAll: logProcedure.input(logIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("ClientLoggerRouter.getAll");

    logger.debug("Getting logs from metadata");

    const loggerRepository = new ClientLogger({
      settingsManager: ctx.settingsManager,
      configurationId: input.id,
    });

    return loggerRepository.getAll();
  }),
});

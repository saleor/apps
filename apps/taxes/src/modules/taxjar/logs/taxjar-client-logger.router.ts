import { router } from "../../trpc/trpc-server";

import { createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { TaxJarClientLogger, logInputSchema } from "./taxjar-client-logger";
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

export const taxjarClientLoggerRouter = router({
  push: logProcedure.input(pushLogInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "taxjarClientLoggerRouter.push",
    });

    logger.debug("Pushing log to metadata");

    const loggerRepository = new TaxJarClientLogger({
      settingsManager: ctx.settingsManager,
      configurationId: input.id,
    });

    return loggerRepository.push(input.log);
  }),
  getAll: logProcedure.input(logIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "taxjarClientLoggerRouter.getAll",
    });

    logger.debug("Getting logs from metadata");

    const loggerRepository = new TaxJarClientLogger({
      settingsManager: ctx.settingsManager,
      configurationId: input.id,
    });

    return loggerRepository.getAll();
  }),
});

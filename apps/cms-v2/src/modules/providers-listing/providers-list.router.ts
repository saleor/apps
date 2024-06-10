import { createSettingsManager } from "../configuration/metadata-manager";

import { z } from "zod";
import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { ProvidersConfig } from "../configuration";
import { createLogger } from "../../logger";

const procedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
      appConfigService: new AppConfigMetadataManager(settingsManager),
    },
  });
});

export const providersListRouter = router({
  getAll: procedure.query(async ({ ctx: { appConfigService } }) => {
    const logger = createLogger("providersListRouter.getAll");

    logger.debug("Fetching providers");

    const config = await appConfigService.get();
    const providers = config.providers.getProviders();

    logger.info("Providers fetched", {
      providers: providers.map((p) => ({ id: p.id })),
    });

    return providers;
  }),
  getOne: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { appConfigService }, input }) => {
      const logger = createLogger("providersListRouter.getOne", {
        providerId: input.id,
      });

      logger.debug("Fetching provider");

      const config = await appConfigService.get();
      const provider = (await config.providers.getProviderById(input.id)) ?? null;

      if (!provider) {
        logger.info("Provider not found");
      } else {
        logger.info("Provider fetched");
      }

      return provider;
    }),
  addOne: procedure
    .input(ProvidersConfig.Schema.AnyInput)
    .mutation(async ({ ctx: { appConfigService }, input }) => {
      const logger = createLogger("providersListRouter.addOne", {
        configName: input.configName,
        type: input.type,
      });

      logger.debug("Adding provider...");

      const config = await appConfigService.get();

      config.providers.addProvider(input);

      await appConfigService.set(config);

      logger.info("Provider added");
    }),
  updateOne: procedure
    .input(ProvidersConfig.Schema.AnyFull)
    .mutation(async ({ input, ctx: { appConfigService } }) => {
      const logger = createLogger("providersListRouter.updateOne", { providerId: input.id });

      logger.debug("Updating provider...");

      const config = await appConfigService.get();

      config?.providers.updateProvider(input);

      const result = await appConfigService.set(config);

      logger.info("Provider updated");

      return result;
    }),
  deleteOne: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { appConfigService } }) => {
      const logger = createLogger("providersListRouter.deleteOne", {
        providerId: input.id,
      });

      logger.debug("Deleting provider");

      const config = await appConfigService.get();

      config.providers.deleteProvider(input.id);

      const result = await appConfigService.set(config);

      logger.info("Provider deleted");

      return result;
    }),
});

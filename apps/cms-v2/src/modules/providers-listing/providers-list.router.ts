import { createSettingsManager } from "../configuration/metadata-manager";

import { z } from "zod";
import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AnyProviderConfigSchema, AnyProvidersInput } from "../configuration";

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
  fetchAllProvidersConfigurations: procedure.query(async ({ ctx: { appConfigService } }) => {
    const config = await appConfigService.get();
    const providers = config.providers.getProviders();

    return providers;
  }),
  fetchConfiguration: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { appConfigService }, input }) => {
      const config = await appConfigService.get();

      return config.providers.getProviderById(input.id) ?? null;
    }),
  addConfiguration: procedure
    .input(AnyProvidersInput)
    .mutation(async ({ ctx: { appConfigService }, input }) => {
      const config = await appConfigService.get();

      config.providers.addProvider(input);

      await appConfigService.set(config);
    }),
  updateProvider: procedure
    .input(AnyProviderConfigSchema)
    .mutation(async ({ input, ctx: { appConfigService } }) => {
      const config = await appConfigService.get();

      config?.providers.updateProvider(input);

      return appConfigService.set(config);
    }),
  deleteProvider: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { appConfigService } }) => {
      const config = await appConfigService.get();

      config.providers.deleteProvider(input.id);

      return appConfigService.set(config);
    }),
});

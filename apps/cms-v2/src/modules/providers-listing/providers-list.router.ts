import { createGraphQLClient } from "@saleor/apps-shared";
import { createSettingsManager } from "../configuration/metadata-manager";

import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";
import { z } from "zod";

// todo add more providers
export const providersListRouter = router({
  fetchAllProvidersConfigurations: protectedClientProcedure.query(async ({ ctx }) => {
    const mm = createSettingsManager(ctx.apiClient, ctx.appId!);

    const settingsManager = new AppConfigMetadataManager(mm);
    const config = await settingsManager.get();
    const providers = config.providers.getProviders();

    return providers;
  }),
  fetchConfiguration: protectedClientProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const mm = createSettingsManager(ctx.apiClient, ctx.appId!);

      const settingsManager = new AppConfigMetadataManager(mm);
      const config = await settingsManager.get();

      return config.providers.getProviderById(input.id) ?? null;
    }),
});

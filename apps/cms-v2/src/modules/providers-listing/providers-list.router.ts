import { createGraphQLClient } from "@saleor/apps-shared";
import { createSettingsManager } from "../configuration/metadata-manager";

import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";

// todo add more providers
export const providersListRouter = router({
  fetchAllProvidersConfigurations: protectedClientProcedure.query(async ({ ctx }) => {
    const client = createGraphQLClient({
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const mm = createSettingsManager(client, ctx.appId!);

    const settingsManager = new AppConfigMetadataManager(mm);
    const config = await settingsManager.get();
    const providers = config.providers.getProviders();

    return providers;
  }),
});

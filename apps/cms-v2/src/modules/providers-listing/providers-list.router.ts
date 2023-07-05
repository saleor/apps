import { createGraphQLClient } from "@saleor/apps-shared";
import { createSettingsManager } from "../configuration/metadata-manager";
import { ContentfulSettingsManager } from "../contentful/config/contentful-settings-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";

// todo add more providers
export const providersListRouter = router({
  fetchAllProvidersConfigurations: protectedClientProcedure.query(async ({ ctx }) => {
    const client = createGraphQLClient({
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const mm = createSettingsManager(client, ctx.appId!);

    const contentfulSettingsManager = new ContentfulSettingsManager(mm);
    const contentfulConfig = await contentfulSettingsManager.get();

    return [
      ...contentfulConfig.getProviders().map((provider) => ({
        ...provider,
        type: "contentful",
      })),
    ];
  }),
});

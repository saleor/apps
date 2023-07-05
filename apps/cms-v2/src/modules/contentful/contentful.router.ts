import { createGraphQLClient } from "@saleor/apps-shared";
import { createSettingsManager } from "../configuration/metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { ContentfulProviderConfigSchemaInput } from "./config/contentful-config";
import { ContentfulSettingsManager } from "./config/contentful-settings-manager";

export const contentfulRouter = router({
  // todo extract services to context
  fetchConfiguration: protectedClientProcedure.query(({ ctx }) => {
    const client = createGraphQLClient({
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const mm = createSettingsManager(client, ctx.appId!);

    const settingsManager = new ContentfulSettingsManager(mm);

    return settingsManager.get();
  }),
  addProvider: protectedClientProcedure
    .input(ContentfulProviderConfigSchemaInput)
    .mutation(async ({ input, ctx }) => {
      const client = createGraphQLClient({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      });

      const mm = createSettingsManager(client, ctx.appId!);

      const settingsManager = new ContentfulSettingsManager(mm);

      const config = await settingsManager.get();

      config?.addProvider(input);

      return settingsManager.set(config);
    }),
});

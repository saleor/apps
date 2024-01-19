import { TRPCError } from "@trpc/server";
import { ChannelsDocument } from "../../../generated/graphql";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { createSettingsManager } from "../../lib/metadata";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "./app-config-metadata-manager";
import { AppConfigurationSchema, FieldsConfigSchema } from "./configuration";
import { fetchLegacyConfiguration } from "./legacy-configuration";
import { createLogger } from "../../lib/logger";

const logger = createLogger("configuration.router");

export const configurationRouter = router({
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);

    /**
     * Backwards compatibility
     */
    const domain = new URL(ctx.saleorApiUrl).host;

    const config = await new AppConfigMetadataManager(settingsManager).get(ctx.saleorApiUrl);

    /**
     * Verify if config is filled with data - by default its null
     */
    if (config.getConfig()) {
      return config.getConfig();
    } else {
      /**
       * Otherwise fetch legacy config from old metadata keys
       */
      const data = await fetchLegacyConfiguration(settingsManager, domain);

      if (data) {
        config.setAlgoliaSettings(data);
      }

      return config.getConfig();
    }
  }),
  setConnectionConfig: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigurationSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: channelsData } = await ctx.apiClient.query(ChannelsDocument, {}).toPromise();
      const channels = channelsData?.channels || [];

      const algoliaClient = new AlgoliaSearchProvider({
        appId: ctx.appId,
        apiKey: input.secretKey,
        indexNamePrefix: input.indexNamePrefix,
        channels,
        enabledKeys: [], // not required to ping algolia, but should be refactored
      });

      const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);

      const configManager = new AppConfigMetadataManager(settingsManager);

      const config = await configManager.get(ctx.saleorApiUrl);

      try {
        logger.trace("Will ping Algolia");
        await algoliaClient.ping();

        logger.trace("Algolia connection is ok. Will save settings");

        config.setAlgoliaSettings(input);

        await configManager.set(config, ctx.saleorApiUrl);

        logger.debug("Settings set successfully");

        const webhooksToggler = new WebhookActivityTogglerService(ctx.appId, ctx.apiClient);

        await webhooksToggler.enableOwnWebhooks();

        logger.debug("Webhooks enabled");
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      return null;
    }),
  setFieldsMappingConfig: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(FieldsConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);
      const configManager = new AppConfigMetadataManager(settingsManager);

      const config = await configManager.get(ctx.saleorApiUrl);

      config.setFieldsMapping(input.enabledAlgoliaFields);

      configManager.set(config, ctx.saleorApiUrl);
    }),
});

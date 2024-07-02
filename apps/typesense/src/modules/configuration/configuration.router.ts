import { TRPCError } from "@trpc/server";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { createSettingsManager } from "../../lib/metadata";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "./app-config-metadata-manager";
import { AppConfigurationSchema, FieldsConfigSchema } from "./configuration";
import { fetchLegacyConfiguration } from "./legacy-configuration";
import { createLogger } from "../../lib/logger";
import { TypesenseSearchProvider } from "../../lib/typesense/typesenseSearchProvider";
import { ChannelsDocument } from "../../../generated/graphql";

const logger = createLogger("configuration.router");

export const configurationRouter = router({
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);

    const domain = new URL(ctx.saleorApiUrl).host;

    const config = await new AppConfigMetadataManager(settingsManager).get(ctx.saleorApiUrl);

    if (config.getConfig()) {
      return config.getConfig();
    } else {
      const data = await fetchLegacyConfiguration(settingsManager, domain);

      if (data) {
        config.setTypesenseSettings(data);
      }

      return config.getConfig();
    }
  }),
  setConnectionConfig: protectedClientProcedure
    .input(AppConfigurationSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: channelsData } = await ctx.apiClient.query(ChannelsDocument, {}).toPromise();
      const channels = channelsData?.channels || [];

      const typesenseClient = new TypesenseSearchProvider({
        apiKey: input.apiKey,
        host: input.host,
        port: input.port,
        protocol: input.protocol,
        connectionTimeoutSeconds: input.connectionTimeoutSeconds,
        channels,
        enabledKeys: [],
      });

      const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);

      const configManager = new AppConfigMetadataManager(settingsManager);

      const config = await configManager.get(ctx.saleorApiUrl);

      try {
        logger.trace("Will ping Typesense");
        await typesenseClient.ping();

        logger.trace("Typesense connection is ok. Will save settings");

        config.setTypesenseSettings(input);

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
    .input(FieldsConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);
      const configManager = new AppConfigMetadataManager(settingsManager);

      try {
        const config = await configManager.get(ctx.saleorApiUrl);

        config.setFieldsMapping(input.enabledTypesenseFields);
        await configManager.set(config, ctx.saleorApiUrl);

        return config.getConfig();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error as string,
        });
      }
    }),
});

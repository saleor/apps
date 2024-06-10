import { TRPCError } from "@trpc/server";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { createSettingsManager } from "../../lib/metadata";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "./app-config-metadata-manager";
import { AppConfigurationSchema, FieldsConfigSchema } from "./configuration";
import { fetchLegacyConfiguration } from "./legacy-configuration";
import { createLogger } from "../../lib/logger";
import { algoliaCredentialsVerifier } from "../../lib/algolia/algolia-credentials-verifier";

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
    .input(AppConfigurationSchema)
    .mutation(async ({ input, ctx }) => {
      const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);

      const configManager = new AppConfigMetadataManager(settingsManager);

      const config = await configManager.get(ctx.saleorApiUrl);

      try {
        logger.info("Will ping Algolia");

        await algoliaCredentialsVerifier.verifyCredentials({
          apiKey: input.secretKey,
          appId: input.appId,
        });

        logger.info("Algolia connection is ok. Will save settings");

        config.setAlgoliaSettings(input);

        await configManager.set(config, ctx.saleorApiUrl);

        logger.info("Settings set successfully");

        const webhooksToggler = new WebhookActivityTogglerService(ctx.appId, ctx.apiClient);

        await webhooksToggler.enableOwnWebhooks();

        logger.info("Webhooks enabled");
      } catch (e) {
        logger.warn("Failed to check Algolia credentials", {
          error: e,
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can't save Algolia config, check credentials",
        });
      }

      return null;
    }),
  setFieldsMappingConfig: protectedClientProcedure
    .input(FieldsConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId);
      const configManager = new AppConfigMetadataManager(settingsManager);

      const config = await configManager.get(ctx.saleorApiUrl);

      config.setFieldsMapping(input.enabledAlgoliaFields);

      configManager.set(config, ctx.saleorApiUrl);
    }),
});

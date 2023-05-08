import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { createSettingsManager } from "./metadata-manager";
import { AppConfigV2MetadataManager } from "./schema-v2/app-config-v2-metadata-manager";
import { GetAppConfigurationV2Service } from "./schema-v2/get-app-configuration.v2.service";
import { PrivateMetadataAppConfiguratorV1 } from "./schema-v1/app-configurator";
import { AppConfigV2 } from "./schema-v2/app-config";
import { ConfigV1ToV2Migrate } from "./schema-v2/config-v1-to-v2-migrate";
import { AppConfigV1 } from "./schema-v1/app-config-v1";
import { Client } from "urql";

// todo unify
const upsertAddressSchema = z.object({
  address: z.object({
    city: z.string().min(1),
    cityArea: z.string(),
    companyName: z.string().min(1),
    country: z.string().min(1),
    streetAddress1: z.string().min(1),
    streetAddress2: z.string(),
    countryArea: z.string(),
    postalCode: z.string().min(1),
  }),
  channelSlug: z.string(),
});

// extract todo
const migrate = async (v1Config: AppConfigV1, apiClient: Client) => {
  const settingsManager = createSettingsManager(apiClient);

  const transformer = new ConfigV1ToV2Migrate();
  const appConfigV2FromV1 = transformer.transform(v1Config);

  const mm = new AppConfigV2MetadataManager(settingsManager);

  await mm.set(appConfigV2FromV1.serialize());

  return appConfigV2FromV1;
};

// todo extract migration
export const appConfigurationRouter = router({
  fetchChannelsOverrides: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouterV2.fetch called");

    const appConfigV2 = await new GetAppConfigurationV2Service(ctx).getConfiguration();

    /**
     * MIGRATION CODE START
     */
    if (!appConfigV2) {
      const v1Config = await new PrivateMetadataAppConfiguratorV1(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      ).getConfig();

      if (!v1Config) {
        return new AppConfigV2().getChannelsOverrides();
      }

      const appConfigV2FromV1 = await migrate(v1Config, ctx.apiClient);

      return appConfigV2FromV1.getChannelsOverrides();
    }
    /**
     * MIGRATION CODE END
     */

    return appConfigV2.getChannelsOverrides();
  }),
  upsertChannelOverride: protectedClientProcedure
    .meta({
      requiredClientPermissions: ["MANAGE_APPS"],
    })
    .input(upsertAddressSchema)
    .mutation(async ({ ctx, input }) => {
      const appConfigV2 = await new GetAppConfigurationV2Service(ctx).getConfiguration();

      /**
       * MIGRATION CODE START
       */
      if (!appConfigV2) {
        const v1Config = await new PrivateMetadataAppConfiguratorV1(
          createSettingsManager(ctx.apiClient),
          ctx.saleorApiUrl
        ).getConfig();

        if (!v1Config) {
          const appConfig = new AppConfigV2();

          appConfig.upsertOverride(input.channelSlug, input.address);

          const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

          return mm.set(appConfig.serialize());
        }

        const appConfigV2FromV1 = await migrate(v1Config, ctx.apiClient);

        appConfigV2FromV1.upsertOverride(input.channelSlug, input.address);

        const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

        return mm.set(appConfigV2FromV1.serialize());
      }
      /**
       * MIGRATION CODE END
       */

      appConfigV2.upsertOverride(input.channelSlug, input.address);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      return mm.set(appConfigV2.serialize());
    }),
  removeChannelOverride: protectedClientProcedure
    .meta({
      requiredClientPermissions: ["MANAGE_APPS"],
    })
    .input(
      z.object({
        channelSlug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const appConfigV2 = await new GetAppConfigurationV2Service(ctx).getConfiguration();

      /**
       * MIGRATION CODE START
       */
      if (!appConfigV2) {
        const v1Config = await new PrivateMetadataAppConfiguratorV1(
          createSettingsManager(ctx.apiClient),
          ctx.saleorApiUrl
        ).getConfig();

        if (!v1Config) {
          const appConfigV2 = new AppConfigV2();

          appConfigV2.removeOverride(input.channelSlug);

          const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

          return mm.set(appConfigV2.serialize());
        }

        const appConfigV2FromV1 = await migrate(v1Config, ctx.apiClient);

        appConfigV2FromV1.removeOverride(input.channelSlug);

        const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

        return mm.set(appConfigV2FromV1.serialize());
      }
      /**
       * MIGRATION CODE END
       */

      appConfigV2.removeOverride(input.channelSlug);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      return mm.set(appConfigV2.serialize());
    }),
});

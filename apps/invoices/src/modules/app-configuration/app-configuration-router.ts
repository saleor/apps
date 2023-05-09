import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { createSettingsManager } from "./metadata-manager";
import { AppConfigV2MetadataManager } from "./schema-v2/app-config-v2-metadata-manager";
import { GetAppConfigurationV2Service } from "./schema-v2/get-app-configuration.v2.service";
import { ConfigV1ToV2MigrationService } from "./schema-v2/config-v1-to-v2-migration.service";
import { AddressV2Schema } from "./schema-v2/app-config-schema.v2";

const UpsertAddressSchema = z.object({
  address: AddressV2Schema,
  channelSlug: z.string(),
});

export const appConfigurationRouter = router({
  fetchChannelsOverrides: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouterV2.fetch called");

    const appConfigV2 = await new GetAppConfigurationV2Service(ctx).getConfiguration();

    /**
     * MIGRATION CODE START - remove when metadata migrated
     */
    if (!appConfigV2) {
      const migrationService = new ConfigV1ToV2MigrationService(ctx.apiClient, ctx.saleorApiUrl);

      return migrationService.migrate().then((config) => config.getChannelsOverrides());
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
    .input(UpsertAddressSchema)
    .mutation(async ({ ctx, input }) => {
      const appConfigV2 = await new GetAppConfigurationV2Service(ctx).getConfiguration();

      /**
       * MIGRATION CODE START - remove when metadata migrated
       */
      if (!appConfigV2) {
        const migrationService = new ConfigV1ToV2MigrationService(ctx.apiClient, ctx.saleorApiUrl);

        await migrationService.migrate((config) =>
          config.upsertOverride(input.channelSlug, input.address)
        );

        return;
      }
      /**
       * MIGRATION CODE END
       */

      appConfigV2.upsertOverride(input.channelSlug, input.address);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      await mm.set(appConfigV2.serialize());
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
       * MIGRATION CODE START - remove when metadata migrated
       */
      if (!appConfigV2) {
        const migrationService = new ConfigV1ToV2MigrationService(ctx.apiClient, ctx.saleorApiUrl);

        await migrationService.migrate((config) => config.removeOverride(input.channelSlug));

        return;
      }
      /**
       * MIGRATION CODE END
       */

      appConfigV2.removeOverride(input.channelSlug);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      return mm.set(appConfigV2.serialize());
    }),
});

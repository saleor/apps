import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { createSettingsManager } from "./metadata-manager";
import { AppConfigV2MetadataManager } from "./schema-v2/app-config-v2-metadata-manager";
import { GetAppConfigurationV2Service } from "./schema-v2/get-app-configuration.v2.service";
import { ConfigV1ToV2MigrationService } from "./schema-v2/config-v1-to-v2-migration.service";
import { AddressV2Schema } from "./schema-v2/app-config-schema.v2";
import { AppConfigV2 } from "./schema-v2/app-config";

const UpsertAddressSchema = z.object({
  address: AddressV2Schema,
  channelSlug: z.string(),
});

export const appConfigurationRouter = router({
  fetchChannelsOverrides: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouterV2.fetch called");

    const appConfigV2 =
      (await new GetAppConfigurationV2Service(ctx).getConfiguration()) ?? new AppConfigV2();

    return appConfigV2.getChannelsOverrides();
  }),
  upsertChannelOverride: protectedClientProcedure
    .input(UpsertAddressSchema)
    .mutation(async ({ ctx, input }) => {
      const appConfigV2 =
        (await new GetAppConfigurationV2Service(ctx).getConfiguration()) ?? new AppConfigV2();

      appConfigV2.upsertOverride(input.channelSlug, input.address);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      await mm.set(appConfigV2.serialize());
    }),
  removeChannelOverride: protectedClientProcedure
    .input(
      z.object({
        channelSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appConfigV2 =
        (await new GetAppConfigurationV2Service(ctx).getConfiguration()) ?? new AppConfigV2();

      appConfigV2.removeOverride(input.channelSlug);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      return mm.set(appConfigV2.serialize());
    }),
});

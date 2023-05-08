import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { createSettingsManager } from "./metadata-manager";
import { AppConfigV2MetadataManager } from "./schema-v2/app-config-v2-metadata-manager";
import { GetAppConfigurationV2Service } from "./schema-v2/get-app-configuration.v2.service";

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

export const appConfigurationRouter = router({
  fetchChannelsOverrides: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouterV2.fetch called");

    const appConfig = await new GetAppConfigurationV2Service(ctx).getConfiguration();

    return appConfig.getChannelsOverrides();
  }),
  upsertChannelOverride: protectedClientProcedure
    .meta({
      requiredClientPermissions: ["MANAGE_APPS"],
    })
    .input(upsertAddressSchema)
    .mutation(async ({ ctx, input }) => {
      const appConfig = await new GetAppConfigurationV2Service(ctx).getConfiguration();

      appConfig.upsertOverride(input.channelSlug, input.address);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      return mm.set(appConfig.serialize());
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
      const appConfig = await new GetAppConfigurationV2Service(ctx).getConfiguration();

      appConfig.removeOverride(input.channelSlug);

      const mm = new AppConfigV2MetadataManager(createSettingsManager(ctx.apiClient));

      return mm.set(appConfig.serialize());
    }),
});

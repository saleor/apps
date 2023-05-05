import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";

import { createSettingsManager } from "../metadata-manager";
import { createLogger } from "@saleor/apps-shared";
import { GetAppConfigurationV2Service } from "./get-app-configuration.v2.service";
import { z } from "zod";
import { AppConfigV2MetadataManager } from "./app-config-v2-metadata-manager";

// todo unify
const upsertAddressSchema = z.object({
  address: z.object({
    city: z.string().min(1),
    cityArea: z.string(),
    companyName: z.string().min(1),
    country: z.string().min(1),
    streetAddress1: z.string().min(1),
    streetAddress2: z.string().min(1),
    countryArea: z.string(),
    postalCode: z.string().min(1),
  }),
  channelSlug: z.string(),
});

export const appConfigurationRouterV2 = router({
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
});

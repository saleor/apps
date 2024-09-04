import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { ChannelConfigurationRepository } from "@/modules/channel-configuration/channel-configuration-repository";
import { ChannelsFetcher } from "@/modules/channel-configuration/channel-fetcher";

import { createLogger } from "../../logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { channelConfigPropertiesSchema } from "./channel-config";
import { ChannelConfigurationService } from "./channel-configuration.service";

const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      connectionService: new ChannelConfigurationService(
        new ChannelConfigurationRepository(
          createSettingsManager(ctx.apiClient, ctx.appId, metadataCache),
          ctx.saleorApiUrl,
        ),
        new ChannelsFetcher(ctx.apiClient),
      ),
    },
  }),
);

export const channelsConfigurationRouter = router({
  getAll: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = createLogger("channelsConfigurationRouter.fetch");

    const channelConfiguration = ctx.connectionService;

    logger.info("Returning channel configuration");

    return channelConfiguration.getAll();
  }),
  upsert: protectedWithConfigurationService
    .input(channelConfigPropertiesSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("channelsConfigurationRouter.upsert", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      const result = await ctx.connectionService.upsert(input);

      logger.info("Channel configuration upserted");

      return result;
    }),
});

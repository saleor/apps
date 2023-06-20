import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { channelConfigPropertiesSchema } from "./channel-config";
import { ChannelConfigurationService } from "./channel-configuration.service";

const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      connectionService: new ChannelConfigurationService(
        ctx.apiClient,
        ctx.appId!,
        ctx.saleorApiUrl
      ),
    },
  })
);

export const channelsConfigurationRouter = router({
  getAll: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = createLogger({
      name: "channelsConfigurationRouter.fetch",
    });

    const channelConfiguration = ctx.connectionService;

    logger.info("Returning channel configuration");

    return channelConfiguration.getAll();
  }),
  upsert: protectedWithConfigurationService
    .input(channelConfigPropertiesSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        saleorApiUrl: ctx.saleorApiUrl,
        procedure: "channelsConfigurationRouter.upsert",
      });

      const result = await ctx.connectionService.upsert(input);

      logger.info("Channel configuration upserted");

      return result;
    }),
});

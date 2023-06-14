import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { channelConfigSchema } from "./channel-config";
import { ChannelConfigurationService } from "./channel-configuration.service";

const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      connectionService: new ChannelConfigurationService(
        ctx.apiClient,
        ctx.appId!,
        ctx.saleorApiUrl
      ),
    },
  })
);

export const channelsConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "channelsConfigurationRouter.fetch",
    });

    const channelConfiguration = ctx.connectionService;

    logger.info("Returning channel configuration");

    return channelConfiguration.getAll();
  }),
  updateById: protectedWithConfigurationService
    .input(channelConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        saleorApiUrl: ctx.saleorApiUrl,
        procedure: "channelsConfigurationRouter.upsert",
      });

      const configurationService = ctx.connectionService;

      await configurationService.updateById(input.id, input.config);

      logger.info("Channel configuration updated");
    }),
});

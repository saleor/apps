import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { channelConfigSchema } from "./channel-config";
import { ChannelConfigurationService } from "./channel-configuration.service";

export const channelsConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "channelsConfigurationRouter.fetch",
    });

    const channelConfiguration = await new ChannelConfigurationService(
      ctx.apiClient,
      ctx.saleorApiUrl
    ).getAll();

    logger.info("Returning channel configuration");

    return channelConfiguration;
  }),
  upsert: protectedClientProcedure.input(channelConfigSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "channelsConfigurationRouter.upsert",
    });

    const configurationService = new ChannelConfigurationService(ctx.apiClient, ctx.saleorApiUrl);

    await configurationService.update(input.id, input.config);

    logger.info("Channel configuration updated");
  }),
});

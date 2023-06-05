import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { setAndReplaceChannelsInputSchema } from "./channel-config-input-schema";
import { ChannelConfigurationService } from "./channel-configuration.service";

// todo: refactor with crud-settings
export const channelsConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "channelsConfigurationRouter.fetch",
    });

    logger.debug("channelsConfigurationRouter.fetch called");

    return new ChannelConfigurationService(ctx.apiClient, ctx.saleorApiUrl).getAll();
  }),
  upsert: protectedClientProcedure
    .input(setAndReplaceChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        saleorApiUrl: ctx.saleorApiUrl,
        procedure: "channelsConfigurationRouter.upsert",
      });

      logger.debug(input, "channelsConfigurationRouter.upsert called with input");

      const configurationService = new ChannelConfigurationService(ctx.apiClient, ctx.saleorApiUrl);

      return configurationService.update(input.channelSlug, input.config);
    }),
});

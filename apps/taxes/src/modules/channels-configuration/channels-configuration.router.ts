import { logger as pinoLogger } from "../../lib/logger";
import { createSettingsManager } from "../app-configuration/metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { ChannelsConfig } from "./channels-config";
import { setAndReplaceChannelsInputSchema } from "./channels-config-input-schema";
import { TaxChannelsConfigurator } from "./channels-configurator";
import { GetChannelsConfigurationService } from "./get-channels-configuration.service";

export const channelsConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("channelsConfigurationRouter.fetch called");

    return new GetChannelsConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  upsert: protectedClientProcedure
    .input(setAndReplaceChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.info(input, "channelsConfigurationRouter.upsert called with input");

      const config = await new GetChannelsConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }).getConfiguration();
      logger.info(config, "Fetched current channels config to update it");

      const taxChannelsConfigurator = new TaxChannelsConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const channelsConfig: ChannelsConfig = {
        ...config,
        [input.channelSlug]: {
          ...config?.[input.channelSlug],
          ...input.config,
        },
      };

      logger.info(channelsConfig, "Merged configs. Will set it now");

      await taxChannelsConfigurator.setConfig(channelsConfig);

      return null;
    }),
});

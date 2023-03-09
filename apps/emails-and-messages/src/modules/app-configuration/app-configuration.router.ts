import { logger as pinoLogger } from "../../lib/logger";
import {
  appChannelConfigurationInputSchema,
  appConfigInputSchema,
} from "./app-config-input-schema";
import { AppConfigurationService } from "./get-app-configuration.service";
import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { z } from "zod";

// Allow access only for the dashboard users and attaches the
// configuration service to the context
const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      configurationService: new AppConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }),
    },
  })
);

export const appConfigurationRouter = router({
  getChannelConfiguration: protectedWithConfigurationService
    .input(z.object({ channelSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug("Get Channel Configuration called");

      return await ctx.configurationService.getChannelConfiguration(input.channelSlug);
    }),

  setChannelConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(appChannelConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug("Set channel configuration called");

      await ctx.configurationService.setChannelConfiguration(input);
    }),
  fetch: protectedWithConfigurationService.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.fetch called");

    return new AppConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  setAndReplace: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(appConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "appConfigurationRouter.setAndReplace called with input");

      await ctx.configurationService.setConfigurationRoot(input);

      return null;
    }),
});

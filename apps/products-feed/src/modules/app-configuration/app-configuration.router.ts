import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { createLogger } from "@saleor/apps-shared";

import { updateCacheForConfigurations } from "../metadata-cache/update-cache-for-configurations";
import { AppConfigSchema } from "./app-config";
import { z } from "zod";

export const appConfigurationRouter = router({
  /**
   * Prefer fetching all to avoid unnecessary calls. Routes are cached by react-query
   */
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.fetch called");

    return ctx.getConfig().then((c) => c.getRootConfig());
  }),
  setS3BucketConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "appConfigurationRouter.setS3BucketConfiguration called with input");

      /**
       * Invalidate cache - todo maybe dont call it here?
       *
       * todo enable when config is fixed
       */
      /*
       * await updateCacheForConfigurations({
       *   client: ctx.apiClient,
       *   configurations: input,
       *   saleorApiUrl: ctx.saleorApiUrl,
       * });
       */

      const config = await ctx.getConfig();

      config.setS3(input);

      await ctx.appConfigMetadataManager.set(config.serialize());

      return null;
    }),
  setChannelsUrls: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(
      z.object({
        channelSlug: z.string(),
        urls: AppConfigSchema.channelUrls,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "appConfigurationRouter.setChannelsUrls called with input");

      const config = await ctx.getConfig();

      console.log("Will set config");
      console.log(input);

      config.setChannelUrls(input.channelSlug, input.urls);

      console.log("config set");
      console.log(config);

      await ctx.appConfigMetadataManager.set(config.serialize());

      return null;
    }),
});

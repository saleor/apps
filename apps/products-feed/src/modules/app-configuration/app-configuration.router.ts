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
  fetch: protectedClientProcedure.query(async ({ ctx: { logger, getConfig }, input }) => {
    return getConfig().then((c) => {
      logger.debug("Fetched config");

      return c.getRootConfig();
    });
  }),
  setS3BucketConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl, getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger({ saleorApiUrl: saleorApiUrl });

      logger.debug(input, "Input");

      const config = await getConfig();

      config.setS3(input);

      await appConfigMetadataManager.set(config.serialize());

      logger.debug("Config saved");

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
    .mutation(
      async ({
        ctx: { getConfig, apiClient, saleorApiUrl, appConfigMetadataManager, logger },
        input,
      }) => {
        const config = await getConfig();

        /**
         * TODO Check if this has to run, once its cached, it should be invalidated by webhooks only.
         *
         * But this operation isnt expensive and users will not continously save this form
         */
        await updateCacheForConfigurations({
          client: apiClient,
          channelsSlugs: [input.channelSlug],
          saleorApiUrl: saleorApiUrl,
        });

        logger.debug({ channel: input.channelSlug }, "Updated cache for channel");

        config.setChannelUrls(input.channelSlug, input.urls);

        await appConfigMetadataManager.set(config.serialize());

        logger.debug("Saved config");

        return null;
      }
    ),
});

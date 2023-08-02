import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { createLogger } from "@saleor/apps-shared";

import { updateCacheForConfigurations } from "../metadata-cache/update-cache-for-configurations";
import { AppConfigSchema } from "./app-config";
import { z } from "zod";
import { createS3ClientFromConfiguration } from "../file-storage/s3/create-s3-client-from-configuration";
import { checkBucketAccess } from "../file-storage/s3/check-bucket-access";
import { TRPCError } from "@trpc/server";
import { AttributeFetcher } from "./attribute-fetcher";

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
  testS3BucketConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl, getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger({ saleorApiUrl: saleorApiUrl });

      logger.debug("Validate the credentials");

      const s3Client = createS3ClientFromConfiguration(input);

      try {
        await checkBucketAccess({
          bucketName: input.bucketName,
          s3Client,
        });
      } catch {
        logger.debug("Validation failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not access the S3 bucket using the provided credentials",
        });
      }
    }),

  setS3BucketConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl, getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger({ saleorApiUrl: saleorApiUrl });

      logger.debug("Validate credentials");

      const s3Client = createS3ClientFromConfiguration(input);

      try {
        await checkBucketAccess({
          bucketName: input.bucketName,
          s3Client,
        });
      } catch {
        logger.debug("Validation failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not access the S3 bucket using the provided credentials",
        });
      }

      logger.debug("Credentials validated, saving");

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
  setAttributeMapping: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigSchema.attributeMapping)
    .mutation(
      async ({
        ctx: { getConfig, apiClient, saleorApiUrl, appConfigMetadataManager, logger },
        input,
      }) => {
        const config = await getConfig();

        config.setAttributeMapping(input);

        await appConfigMetadataManager.set(config.serialize());

        return null;
      }
    ),

  getAttributes: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .query(async ({ ctx: { logger, apiClient } }) => {
      const fetcher = new AttributeFetcher(apiClient);

      const result = await fetcher.fetchAllAttributes().catch((e) => {
        logger.error(e, "Can't fetch the attributes");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't fetch the attributes",
        });
      });

      logger.debug("Returning attributes");

      return result;
    }),
});

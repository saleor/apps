import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

import { AppConfigSchema, imageSizeInputSchema, titleTemplateInputSchema } from "./app-config";
import { z } from "zod";
import { createS3ClientFromConfiguration } from "../file-storage/s3/create-s3-client-from-configuration";
import { checkBucketAccess } from "../file-storage/s3/check-bucket-access";
import { TRPCError } from "@trpc/server";
import { AttributeFetcher } from "./attribute-fetcher";
import { renderHandlebarsTemplate } from "../handlebarsTemplates/render-handlebars-template";
import { prepareExampleVariantData } from "./prepare-example-variant-data";
import { createLogger } from "../../logger";

export const appConfigurationRouter = router({
  /**
   * Prefer fetching all to avoid unnecessary calls. Routes are cached by react-query
   */
  fetch: protectedClientProcedure.query(async ({ ctx: { logger, getConfig } }) => {
    logger.debug("Fetching configuration");

    try {
      const configuration = await getConfig();

      logger.debug("Configuration fetched");
      return configuration.getRootConfig();
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Can't fetch the configuration",
      });
    }
  }),
  testS3BucketConfiguration: protectedClientProcedure
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl }, input }) => {
      const logger = createLogger("Test S3 bucket configuration", { saleorApiUrl: saleorApiUrl });

      logger.debug("Validate the credentials");

      const s3Client = createS3ClientFromConfiguration(input);

      try {
        await checkBucketAccess({
          bucketName: input.bucketName,
          s3Client,
        });
        logger.debug("Verification succeeded");
      } catch {
        logger.debug("Validation failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not access the S3 bucket using the provided credentials",
        });
      }
    }),

  setS3BucketConfiguration: protectedClientProcedure
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl, getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger("Set S3 bucket configuration", { saleorApiUrl: saleorApiUrl });

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
    .input(
      z.object({
        channelSlug: z.string(),
        urls: AppConfigSchema.channelUrls,
      }),
    )
    .mutation(
      async ({
        ctx: { getConfig, apiClient, saleorApiUrl, appConfigMetadataManager, logger },
        input,
      }) => {
        const config = await getConfig();

        logger.debug({ channel: input.channelSlug }, "Updated cache for channel");

        config.setChannelUrls(input.channelSlug, input.urls);

        await appConfigMetadataManager.set(config.serialize());

        logger.debug("Saved config");

        return null;
      },
    ),
  setAttributeMapping: protectedClientProcedure
    .input(AppConfigSchema.attributeMapping)
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager, logger }, input }) => {
      logger.debug("Setting attribute mapping");
      const config = await getConfig();

      config.setAttributeMapping(input);

      await appConfigMetadataManager.set(config.serialize());
      logger.debug("Attribute map set");
      return null;
    }),
  getAttributes: protectedClientProcedure.query(async ({ ctx: { logger, apiClient } }) => {
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
  setImageSize: protectedClientProcedure
    .input(imageSizeInputSchema)
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager, logger }, input }) => {
      logger.debug("Setting image size");
      const config = await getConfig();

      config.setImageSize(input.imageSize);

      await appConfigMetadataManager.set(config.serialize());

      logger.debug("image size set");
      return null;
    }),

  setTitleTemplate: protectedClientProcedure
    .input(titleTemplateInputSchema)
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager, logger }, input }) => {
      logger.debug("Setting title template");
      const config = await getConfig();

      // Test render to prevent saving invalid template
      try {
        renderHandlebarsTemplate({
          data: {},
          template: input.titleTemplate,
        });
      } catch (err) {
        logger.debug({ error: err }, "Template render failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submitted template is invalid",
        });
      }

      config.setTitleTemplate(input.titleTemplate);

      await appConfigMetadataManager.set(config.serialize());

      logger.debug("Template title set");
      return null;
    }),

  renderTemplate: protectedClientProcedure
    .input(titleTemplateInputSchema)
    .mutation(async ({ ctx: { getConfig, logger }, input }) => {
      logger.debug(input, "renderTemplate called");
      const config = await getConfig();

      try {
        const title = renderHandlebarsTemplate({
          data: prepareExampleVariantData({
            attributeMapping: config.getAttributeMapping(),
          }),
          template: input.titleTemplate,
        });

        logger.debug("Title rendered succeeded");

        return { title };
      } catch (err) {
        logger.debug({ error: err }, "Template render failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submitted template is invalid",
        });
      }
    }),
});

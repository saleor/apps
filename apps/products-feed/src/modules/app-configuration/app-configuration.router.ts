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
  fetch: protectedClientProcedure.query(async ({ ctx: { getConfig } }) => {
    const logger = createLogger("appConfigurationRouter.fetch");

    logger.debug("Fetching configuration");

    try {
      const configuration = await getConfig();

      logger.debug("Configuration fetched");
      return configuration.getRootConfig();
    } catch (e) {
      logger.warn("Can't fetch the configuration", { error: e });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Can't fetch the configuration",
      });
    }
  }),
  testS3BucketConfiguration: protectedClientProcedure
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl }, input }) => {
      const logger = createLogger("appConfigurationRouter.testS3BucketConfiguration", {
        saleorApiUrl: saleorApiUrl,
        buckeName: input.bucketName,
        bucketRegion: input.region,
      });

      logger.debug("Validate the credentials");

      const s3Client = createS3ClientFromConfiguration(input);

      try {
        await checkBucketAccess({
          bucketName: input.bucketName,
          s3Client,
        });
        logger.info("Verification succeeded");
      } catch {
        logger.warn("Validation failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not access the S3 bucket using the provided credentials",
        });
      }
    }),

  setS3BucketConfiguration: protectedClientProcedure
    .input(AppConfigSchema.s3Bucket)
    .mutation(async ({ ctx: { saleorApiUrl, getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger("appConfigurationRouter.setS3BucketConfiguration", {
        saleorApiUrl: saleorApiUrl,
        buckeName: input.bucketName,
        bucketRegion: input.region,
      });

      logger.debug("Validate credentials");

      const s3Client = createS3ClientFromConfiguration(input);

      try {
        await checkBucketAccess({
          bucketName: input.bucketName,
          s3Client,
        });

        logger.info("Bucket access check succeeded");
      } catch (e) {
        logger.warn("Bucket access check failed", { error: e });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not access the S3 bucket using the provided credentials",
        });
      }

      logger.debug("Credentials validated, saving");

      const config = await getConfig();

      config.setS3(input);

      await appConfigMetadataManager.set(config.serialize());

      logger.info("Config saved");

      return null;
    }),
  setChannelsUrls: protectedClientProcedure
    .input(
      z.object({
        channelSlug: z.string(),
        urls: AppConfigSchema.channelUrls,
      }),
    )
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger("appConfigurationRouter.setChannelsUrls", {
        channel: input.channelSlug,
        urls: input.urls,
      });
      const config = await getConfig();

      logger.debug("Updated cache for channel");

      config.setChannelUrls(input.channelSlug, input.urls);

      await appConfigMetadataManager.set(config.serialize());

      logger.info("Saved config");

      return null;
    }),
  setAttributeMapping: protectedClientProcedure
    .input(AppConfigSchema.attributeMapping)
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger("appConfigurationRouter.setAttributeMapping");

      logger.debug("Setting attribute mapping");
      const config = await getConfig();

      config.setAttributeMapping(input);

      await appConfigMetadataManager.set(config.serialize());
      logger.info("Attribute map set");
      return null;
    }),
  getAttributes: protectedClientProcedure.query(async ({ ctx: { apiClient } }) => {
    const logger = createLogger("appConfigurationRouter.getAttributes");

    const fetcher = new AttributeFetcher(apiClient);

    const result = await fetcher.fetchAllAttributes().catch((e) => {
      logger.error("Can't fetch the attributes", { error: e });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Can't fetch the attributes",
      });
    });

    logger.debug("Returning attributes", { first: result[0], totaLength: result.length });

    return result;
  }),
  setImageSize: protectedClientProcedure
    .input(imageSizeInputSchema)
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger("appConfigurationRouter.setImageSize");

      logger.debug("Setting image size", { imageSize: input.imageSize });
      const config = await getConfig();

      config.setImageSize(input.imageSize);

      await appConfigMetadataManager.set(config.serialize());

      logger.info("image size set");
      return null;
    }),

  setTitleTemplate: protectedClientProcedure
    .input(titleTemplateInputSchema)
    .mutation(async ({ ctx: { getConfig, appConfigMetadataManager }, input }) => {
      const logger = createLogger("appConfigurationRouter.setTitleTemplate");

      logger.debug("Setting title template", { titleTemplate: input.titleTemplate });
      const config = await getConfig();

      // Test render to prevent saving invalid template
      try {
        renderHandlebarsTemplate({
          data: {},
          template: input.titleTemplate,
        });
      } catch (err) {
        logger.warn("Template render failed", { error: err });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submitted template is invalid",
        });
      }

      config.setTitleTemplate(input.titleTemplate);

      await appConfigMetadataManager.set(config.serialize());

      logger.info("Template title set");
      return null;
    }),

  renderTemplate: protectedClientProcedure
    .input(titleTemplateInputSchema)
    .mutation(async ({ ctx: { getConfig }, input }) => {
      const logger = createLogger("appConfigurationRouter.setTitleTemplate");

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
        logger.warn("Template render failed", { error: err });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submitted template is invalid",
        });
      }
    }),
});

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createS3ClientFromConfiguration } from "../file-storage/s3/create-s3-client-from-configuration";
import { uploadFile } from "../file-storage/s3/upload-file";
import { getDownloadUrl, getFileName } from "../file-storage/s3/urls-and-names";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { fetchShopData } from "./fetch-shop-data";
import { generateGoogleXmlFeed } from "./generate-google-xml-feed";
import { GoogleFeedSettingsFetcher } from "./get-google-feed-settings";

export const feedRouter = router({
  generateAndUploadFeed: protectedClientProcedure
    .input(
      z.object({
        productVariants: z.array(z.any()), //todo
        channelSlug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const settingsFetcher = GoogleFeedSettingsFetcher.createFromAuthData({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      });
      const settings = await settingsFetcher.fetch(input.channelSlug);

      const shopDetails = await fetchShopData({
        client: ctx.apiClient,
        channel: input.channelSlug,
      });

      const xmlContent = generateGoogleXmlFeed({
        shopDescription: shopDetails.shopDescription,
        shopName: shopDetails.shopName,
        storefrontUrl: settings.storefrontUrl,
        productStorefrontUrl: settings.productStorefrontUrl,
        productVariants: input.productVariants,
        attributeMapping: settings.attributeMapping,
        titleTemplate: settings.titleTemplate,
      });

      if (!settings.s3BucketConfiguration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "App not configured - configure bucket first",
        });
      }

      const s3Client = createS3ClientFromConfiguration(settings.s3BucketConfiguration);
      const fileName = getFileName({
        saleorApiUrl: ctx.saleorApiUrl,
        channel: input.channelSlug,
      });

      await uploadFile({
        s3Client,
        bucketName: settings.s3BucketConfiguration.bucketName,
        buffer: Buffer.from(xmlContent),
        fileName,
      });

      // https://docs.aws.amazon.com/AmazonS3/latest/API/s3_example_s3_Scenario_PresignedUrl_section.html
      const downloadUrl = getDownloadUrl({
        s3BucketConfiguration: settings.s3BucketConfiguration,
        saleorApiUrl: ctx.saleorApiUrl,
        channel: input.channelSlug,
      });

      return { downloadUrl };
    }),
});

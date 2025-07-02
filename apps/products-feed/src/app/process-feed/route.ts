import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { NextRequest } from "next/server";

import { AllChannelsDocument } from "../../../generated/graphql";
import { xmlParser } from "../../lib/xml";
import { dbVariantsStorage } from "../../modules/db-variants-storage/db-variants-storage.impl";
import { createS3ClientFromConfiguration } from "../../modules/file-storage/s3/create-s3-client-from-configuration";
import { getFileName } from "../../modules/file-storage/s3/urls-and-names";
import { GoogleFeedSettingsFetcher } from "../../modules/google-feed/get-google-feed-settings";
import { ProcessingDto } from "../dto";
import { fetchProductData } from "../../modules/google-feed/fetch-product-data";

const repo = dbVariantsStorage;

// todo: this must be protected to be only called from vercel, add some tokens etc
export const POST = async (req: NextRequest) => {
  const body = (await req.json()) as ProcessingDto;
  const authData = body.authData;

  const dirtyVariants = await repo.getDirtyVariants({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
  });

  if (dirtyVariants.length === 0) {
    return new Response("Nothing to process", {
      status: 200,
    });
  }

  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });
  const allChannelsResponse = await client.query(AllChannelsDocument, {});
  const allChannelsSlugs = allChannelsResponse.data?.channels?.map((c) => c.slug);

  if (!allChannelsSlugs || !allChannelsSlugs.length) {
    return new Response("Cant process channels");
  }

  const settingsFetcher = GoogleFeedSettingsFetcher.createFromAuthData(authData);
  const allSettingsPerChannel = await Promise.all(
    allChannelsSlugs.map(async (slug) => {
      const settings = await settingsFetcher.fetch(slug);

      return {
        settings,
        channelSlug: slug,
      };
    }),
  );

  // todo this should be parallel, change to services, use promise all
  for (const channelSetting of allSettingsPerChannel) {
    if (!channelSetting.settings.s3BucketConfiguration) {
      // app not confiuged, skip
      continue;
    }

    const s3Client = createS3ClientFromConfiguration(channelSetting.settings.s3BucketConfiguration);
    const fileName = getFileName({
      saleorApiUrl: authData.saleorApiUrl,
      channel: channelSetting.channelSlug,
    });

    // Fetch XML file from S3
    let xmlFileContent: string | null = null;

    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const command = new GetObjectCommand({
        Bucket: channelSetting.settings.s3BucketConfiguration.bucketName,
        Key: fileName,
      });
      const s3Object = await s3Client.send(command);

      xmlFileContent = (await s3Object.Body?.transformToString()) ?? null;
    } catch (error) {
      // Handle error (e.g., file not found)
      xmlFileContent = null;
    }

    if (!xmlFileContent) {
      // todo what to do? Probably ignore or create empty XML without initial feed

      continue;
    }

    const xmlAsJsObject = xmlParser.parse(xmlFileContent);

    console.log(xmlAsJsObject[1].rss[0].channel[2]);

    const variants = await Promise.all(
      dirtyVariants.map(id => fetchProductData({ client, channel: , imageSize }))
    )

    /*
     * todo
     * 1: modify xml
     * 2: save new XML
     * 3: upload XML
     * 4: delete items from dynamo
     * 5: call myself again, pass cached data like config
     */
  }

  return new Response("OK");
};

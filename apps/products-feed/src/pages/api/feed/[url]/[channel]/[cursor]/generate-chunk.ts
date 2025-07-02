import { AuthData } from "@saleor/app-sdk/APL";
import { NextApiHandler } from "next";

import { createInstrumentedGraphqlClient } from "../../../../../../lib/create-instrumented-graphql-client";
import { createS3ClientFromConfiguration } from "../../../../../../modules/file-storage/s3/create-s3-client-from-configuration";
import { uploadFile } from "../../../../../../modules/file-storage/s3/upload-file";
import {
  getChunkFileName,
  getDownloadUrl,
} from "../../../../../../modules/file-storage/s3/urls-and-names";
import { FeedXmlBuilder } from "../../../../../../modules/google-feed/feed-xml-builder";
import { fetchVariants } from "../../../../../../modules/google-feed/fetch-product-data";
import { GoogleFeedSettingsFetcher } from "../../../../../../modules/google-feed/get-google-feed-settings";
import { productVariantToProxy } from "../../../../../../modules/google-feed/product-variant-to-proxy";

type ConfiguredChannelSettings = Awaited<
  ReturnType<typeof GoogleFeedSettingsFetcher.prototype.fetch>
>;

const xmlBuilder = new FeedXmlBuilder();

// todo auth / private network
const handler: NextApiHandler = async (req, res) => {
  const params = req.query;
  const parsedBody = JSON.parse(req.body);
  const { authData, channelSettings } = parsedBody as {
    authData: AuthData;
    channelSettings: ConfiguredChannelSettings;
  };
  const { cursor, channel, url } = params as { cursor: string; channel: string; url: string };

  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const productVariants = await fetchVariants({
    client,
    channel: channel,
    imageSize: channelSettings.imageSize,
    after: cursor,
  });

  const productProxies = productVariants.map((v) =>
    productVariantToProxy({
      variant: v,
      attributeMapping: channelSettings.attributeMapping,
      titleTemplate: channelSettings.titleTemplate,
      productStorefrontUrl: channelSettings.productStorefrontUrl,
    }),
  );

  const xmlChunk = xmlBuilder.buildItemsChunk(productProxies);

  if (!channelSettings.s3BucketConfiguration) {
    return res.status(400).send({ message: "Bucket not configured" });
  }

  const s3Client = createS3ClientFromConfiguration(channelSettings.s3BucketConfiguration);
  const fileName = getChunkFileName({
    saleorApiUrl: authData.saleorApiUrl,
    channel,
    cursor,
  });

  await uploadFile({
    s3Client,
    bucketName: channelSettings.s3BucketConfiguration.bucketName,
    buffer: Buffer.from(xmlChunk),
    fileName,
  });

  const downloadUrl = getDownloadUrl({
    s3BucketConfiguration: channelSettings.s3BucketConfiguration,
    saleorApiUrl: authData.saleorApiUrl,
    channel,
  });

  return res.status(200).send({ downloadUrl });
};

export default handler;

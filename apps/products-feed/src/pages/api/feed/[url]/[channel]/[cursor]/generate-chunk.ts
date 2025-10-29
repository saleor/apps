import { AuthData } from "@saleor/app-sdk/APL";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { NextApiHandler } from "next";

import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { chunkFeedUrlParams } from "@/modules/feed-dto";
import { createS3ClientFromConfiguration } from "@/modules/file-storage/s3/create-s3-client-from-configuration";
import { getChunkFileName } from "@/modules/file-storage/s3/file-names";
import { SignedUrls } from "@/modules/file-storage/s3/signed-urls";
import { uploadFile } from "@/modules/file-storage/s3/upload-file";
import { FeedXmlBuilder } from "@/modules/google-feed/feed-xml-builder";
import { fetchVariants } from "@/modules/google-feed/fetch-product-data";
import { GoogleFeedSettingsFetcher } from "@/modules/google-feed/get-google-feed-settings";
import { productVariantToProxy } from "@/modules/google-feed/product-variant-to-proxy";

type ConfiguredChannelSettings = Awaited<
  ReturnType<typeof GoogleFeedSettingsFetcher.prototype.fetch>
>;

const xmlBuilder = new FeedXmlBuilder();
const logger = createLogger("generate-chunk");

const handler: NextApiHandler = async (req, res) => {
  const secret = req.headers["authorization"];

  if (secret !== process.env.REQUEST_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  const params = req.query;
  const parsedBody = JSON.parse(req.body);

  // TODO: Validate with ZOD
  const { authData, channelSettings } = parsedBody as {
    authData: AuthData;
    channelSettings: ConfiguredChannelSettings;
  };
  const { cursor, channel } = chunkFeedUrlParams.parse(params);

  const decodedCursor = decodeURIComponent(cursor);

  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, authData.saleorApiUrl);
  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channel);

  logger.info("Generate chunk of products", {
    cursor: decodedCursor,
  });

  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const productVariants = await fetchVariants({
    client,
    channel: channel,
    imageSize: channelSettings.imageSize,
    after: decodedCursor,
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
    cursor: decodedCursor,
  });

  await uploadFile({
    s3Client,
    bucketName: channelSettings.s3BucketConfiguration.bucketName,
    buffer: Buffer.from(xmlChunk),
    fileName,
  });

  const downloadUrl = await new SignedUrls(s3Client).generateSignedGetObjectUrl({
    expiresSeconds: 30,
    fileName,
    bucket: channelSettings.s3BucketConfiguration.bucketName,
  });

  return res.status(200).send({ downloadUrl, fileName });
};

export default wrapWithLoggerContext(handler, loggerContext);

import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleFeedProductVariantFragment } from "../../../../../../generated/graphql";
import { apl } from "../../../../../saleor-app";
import { fetchProductData } from "../../../../../modules/google-feed/fetch-product-data";
import { GoogleFeedSettingsFetcher } from "../../../../../modules/google-feed/get-google-feed-settings";
import { generateGoogleXmlFeed } from "../../../../../modules/google-feed/generate-google-xml-feed";
import { fetchShopData } from "../../../../../modules/google-feed/fetch-shop-data";
import { uploadFile } from "../../../../../modules/file-storage/s3/upload-file";
import { createS3ClientFromConfiguration } from "../../../../../modules/file-storage/s3/create-s3-client-from-configuration";
import { getFileDetails } from "../../../../../modules/file-storage/s3/get-file-details";
import { getDownloadUrl, getFileName } from "../../../../../modules/file-storage/s3/urls-and-names";
import { RootConfig } from "../../../../../modules/app-configuration/app-config";
import { z, ZodError } from "zod";
import { withOtel } from "@saleor/apps-otel";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { createLogger } from "../../../../../logger";
import { loggerContext } from "../../../../../logger-context";
import { getOtelTracer } from "@saleor/apps-otel/src/otel-tracer";
import { createInstrumentedGraphqlClient } from "../../../../../lib/create-instrumented-graphql-client";

// By default we cache the feed for 5 minutes. This can be changed by setting the FEED_CACHE_MAX_AGE
const FEED_CACHE_MAX_AGE = process.env.FEED_CACHE_MAX_AGE
  ? parseInt(process.env.FEED_CACHE_MAX_AGE, 10)
  : 60 * 5;

const validateRequestParams = (req: NextApiRequest) => {
  const queryShape = z.object({
    url: z.string().url("Valid API URL must be provided"),
    channel: z.string().min(1, "Provide valid channel slug"),
  });

  queryShape.parse(req.query);
};

const tracer = getOtelTracer();

/**
 * TODO Refactor and test
 */
export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = req.query.url as string;
  const channel = req.query.channel as string;

  const logger = createLogger("Feed handler", {
    saleorApiUrl: url,
    channel,
    route: "api/feed/{url}/{channel}/google.xml",
  });

  logger.info("Generating Google Feed");

  try {
    validateRequestParams(req);
  } catch (e) {
    const error = e as ZodError;

    return res.status(400).json({ error: error.flatten().fieldErrors });
  }

  logger.debug("Checking if app is installed in the given env");
  const authData = await apl.get(url as string);

  if (!authData) {
    logger.error(`The app has not been configured with the ${url}`);
    return res.status(400).json({ error: "The given instance has not been registered" });
  }

  logger.debug("The app is registered for the given URL, checking the configuration");

  /**
   * use unauthorized client to eliminate possibility of spilling the non-public data
   */
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  if (!client) {
    logger.error("Can't create the gql client");

    return res.status(500).send("Error creating feed");
  }

  let storefrontUrl: string;
  let productStorefrontUrl: string;
  let bucketConfiguration: RootConfig["s3"] | undefined;
  let attributeMapping: RootConfig["attributeMapping"] | undefined;
  let titleTemplate: RootConfig["titleTemplate"] | undefined;
  let imageSize: RootConfig["imageSize"] | undefined;

  try {
    const settingsFetcher = GoogleFeedSettingsFetcher.createFromAuthData(authData);
    const settings = await settingsFetcher.fetch(channel);

    storefrontUrl = settings.storefrontUrl;
    productStorefrontUrl = settings.productStorefrontUrl;
    bucketConfiguration = settings.s3BucketConfiguration;
    attributeMapping = settings.attributeMapping;
    titleTemplate = settings.titleTemplate;
    imageSize = settings.imageSize;
  } catch (error) {
    logger.warn("The application has not been configured");

    return res
      .status(400)
      .json({ error: "Please configure the Google Feed settings at the dashboard" });
  }

  let shopName: string;
  let shopDescription: string | undefined;

  try {
    const shopDetails = await fetchShopData({ client, channel });

    shopName = shopDetails.shopName;
    shopDescription = shopDetails.shopDescription;
  } catch (error) {
    logger.error("Could not fetch the shop details");

    return res.status(500).json({ error: "Could not fetch the shop details" });
  }

  if (bucketConfiguration) {
    logger.debug("Bucket configuration found, checking if the feed has been generated recently");

    const s3Client = createS3ClientFromConfiguration(bucketConfiguration);
    const fileName = getFileName({
      saleorApiUrl: authData.saleorApiUrl,
      channel,
    });

    const feedLastModificationDate = await getFileDetails({
      s3Client,
      bucketName: bucketConfiguration.bucketName,
      fileName,
    })
      .then((data) => data.LastModified)
      // If the file does not exist, error is thrown and we can ignore it
      .catch(() => {
        logger.debug("Feed file not found in S3", {
          bucketName: bucketConfiguration!.bucketName,
          fileName,
        });
        return undefined;
      });

    if (feedLastModificationDate) {
      logger.debug("Feed has been generated previously, checking the last modification date");

      const secondsSinceLastModification = (Date.now() - feedLastModificationDate.getTime()) / 1000;

      if (secondsSinceLastModification < FEED_CACHE_MAX_AGE) {
        logger.debug("Feed has been generated recently, returning the last version");

        const downloadUrl = getDownloadUrl({
          s3BucketConfiguration: bucketConfiguration,
          saleorApiUrl: authData.saleorApiUrl,
          channel,
        });

        return res.redirect(downloadUrl);
      }

      logger.debug("Feed is outdated, generating a new one");
    }
  }

  logger.debug("Generating a new feed");

  let productVariants: GoogleFeedProductVariantFragment[] = [];

  try {
    productVariants = await fetchProductData({ client, channel, imageSize });
  } catch (error) {
    logger.error(error);
    return res.status(400).end();
  }

  logger.debug("Product data fetched. Generating the output");

  const xmlContent = generateGoogleXmlFeed({
    shopDescription,
    shopName,
    storefrontUrl,
    productStorefrontUrl,
    productVariants,
    attributeMapping,
    titleTemplate,
  });

  logger.debug("Feed generated. Returning formatted XML");

  if (!bucketConfiguration) {
    logger.debug("Bucket configuration not found, returning feed directly");

    res.setHeader("Content-Type", "text/xml");
    res.setHeader("Cache-Control", `s-maxage=${FEED_CACHE_MAX_AGE}`);
    res.write(xmlContent);
    res.end();
    return;
  }

  logger.debug("Bucket configuration found, uploading the feed to S3");
  const s3Client = createS3ClientFromConfiguration(bucketConfiguration);
  const fileName = getFileName({
    saleorApiUrl: authData.saleorApiUrl,
    channel,
  });

  await tracer.startActiveSpan("upload to s3", async (span) => {
    span.setAttribute("bucketName", bucketConfiguration!.bucketName);
    span.setAttribute("fileName", fileName);

    try {
      await uploadFile({
        s3Client,
        bucketName: bucketConfiguration!.bucketName,
        buffer: Buffer.from(xmlContent),
        fileName,
      });

      const downloadUrl = getDownloadUrl({
        s3BucketConfiguration: bucketConfiguration!,
        saleorApiUrl: authData.saleorApiUrl,
        channel,
      });

      logger.debug("Feed uploaded to S3, redirecting the download URL", {
        downloadUrl,
      });

      return res.redirect(downloadUrl);
    } catch (error) {
      logger.error("Could not upload the feed to S3");
      span.setStatus({ code: SpanStatusCode.ERROR });
      return res.status(500).json({ error: "Could not upload the feed to S3" });
    } finally {
      span.end();
    }
  });
};

export default wrapWithLoggerContext(
  withOtel(handler, "/api/feed/[url]/[channel]/google.xml"),
  loggerContext,
);

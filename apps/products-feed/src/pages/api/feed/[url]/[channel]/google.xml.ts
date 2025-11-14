import { SpanStatusCode } from "@opentelemetry/api";
import { AuthData } from "@saleor/app-sdk/APL";
import { getBaseUrl } from "@saleor/app-sdk/headers";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

import { appRootTracer } from "@/lib/app-root-tracer";
import { ChunkCaller } from "@/lib/chunk-caller";
import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { RootConfig } from "@/modules/app-configuration/app-config";
import { createS3ClientFromConfiguration } from "@/modules/file-storage/s3/create-s3-client-from-configuration";
import { getFileName } from "@/modules/file-storage/s3/file-names";
import { FileRemover } from "@/modules/file-storage/s3/file-remover";
import { getFileDetails } from "@/modules/file-storage/s3/get-file-details";
import { SignedUrls } from "@/modules/file-storage/s3/signed-urls";
import { uploadFile } from "@/modules/file-storage/s3/upload-file";
import { FeedXmlBuilder } from "@/modules/google-feed/feed-xml-builder";
import { getCursors } from "@/modules/google-feed/fetch-product-data";
import { fetchShopData } from "@/modules/google-feed/fetch-shop-data";
import { GoogleFeedSettingsFetcher } from "@/modules/google-feed/get-google-feed-settings";
import { shopDetailsToProxy } from "@/modules/google-feed/shop-details-to-proxy";
import { apl } from "@/saleor-app";
import { FEED_CACHE_MAX_AGE, MAX_PARALLEL_CALLS } from "@/settings";

const validateRequestParams = (req: NextApiRequest) => {
  const queryShape = z.object({
    url: z.string().url("Valid API URL must be provided"),
    channel: z.string().min(1, "Provide valid channel slug"),
  });

  queryShape.parse(req.query);
};

const logger = createLogger("Feed handler", {
  route: "api/feed/{url}/{channel}/google.xml",
});

const fetchXmlChunk = (downloadUrl: string) =>
  fetch(downloadUrl)
    .then((r) => r.text())
    .catch((e) => {
      throw new Error("Failed to download chunk from s3", { cause: e });
    });

const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>,
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      logger.error("Unhandled error in feed handler", { error: error });

      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  };
};

const generateDistributedChunk = (params: {
  authData: AuthData;
  channel: string;
  cursor: string;
  baseUrl: string;
  channelSettings: Awaited<ReturnType<(typeof GoogleFeedSettingsFetcher)["prototype"]["fetch"]>>;
}) => {
  const urlToFetch = new URL(
    `/api/feed/${encodeURIComponent(params.authData.saleorApiUrl)}/${encodeURIComponent(
      params.channel,
    )}/${encodeURIComponent(params.cursor)}/generate-chunk`,
    params.baseUrl,
  );

  return fetch(urlToFetch, {
    body: JSON.stringify({
      authData: params.authData,
      channelSettings: params.channelSettings,
    }),
    headers: {
      ContentType: "application/json",
      authorization: process.env.REQUEST_SECRET as string,
    },
    method: "POST",
  })
    .then((r) => r.json() as Promise<{ downloadUrl: string; fileName: string }>)
    .catch((e) => {
      throw new Error("Failed to generate chunk", {
        cause: e,
      });
    });
};

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = req.query.url as string;
  const channel = req.query.channel as string;

  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, url);
  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channel);

  logger.info("Generating Google Feed");

  try {
    validateRequestParams(req);
    logger.info("Request params validated");
  } catch (e) {
    const error = e as ZodError;
    const fieldErrors = error.flatten().fieldErrors;

    logger.warn("Invalid request params", { error: fieldErrors });

    return res.status(400).json({ error: fieldErrors });
  }

  logger.debug("Checking if app is installed in the given env");
  const authData = await apl.get(url as string);

  if (!authData) {
    logger.warn(`The app has not been configured with the ${url}`);

    return res.status(400).json({ error: "The given instance has not been registered" });
  }

  logger.debug("The app is registered for the given URL, checking the configuration", {
    appId: authData.appId,
  });

  /**
   * use unauthorized client to eliminate possibility of spilling the non-public data
   */
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, authData.saleorApiUrl);

  loggerContext.set(ObservabilityAttributes.CHANNEL_SLUG, channel);

  if (!client) {
    logger.error("Can't create the gql client");

    return res.status(500).send("Error creating feed");
  }

  let storefrontUrl: string;
  let bucketConfiguration: RootConfig["s3"] | undefined;

  let channelSettings: any;

  try {
    const settingsFetcher = GoogleFeedSettingsFetcher.createFromAuthData(authData);
    const settings = await settingsFetcher.fetch(channel);

    channelSettings = settings;

    if (!settings.s3BucketConfiguration) {
      return res.status(400).send("App not configured");
    }

    logger.info("Settings has been fetched", {
      storefrontUrl: settings.storefrontUrl,
      productStorefrontUrl: settings.productStorefrontUrl,
      bucketName: settings.s3BucketConfiguration?.bucketName,
      attributeMapping: settings.attributeMapping,
      titleTemplate: settings.titleTemplate,
      imageSize: settings.imageSize,
    });

    storefrontUrl = settings.storefrontUrl;
    bucketConfiguration = settings.s3BucketConfiguration;
  } catch (error) {
    logger.warn("The application has not been configured", { error: error });

    return res
      .status(400)
      .json({ error: "Please configure the Google Feed settings at the dashboard" });
  }

  let shopName: string;
  let shopDescription: string | undefined;

  try {
    const shopDetails = await fetchShopData({ client, channel });

    logger.info("Shop details have been fetched", {
      shopName: shopDetails.shopName,
      shopDescription: shopDetails.shopDescription,
    });

    shopName = shopDetails.shopName;
    shopDescription = shopDetails.shopDescription;
  } catch (error) {
    logger.error("Could not fetch the shop details");

    return res.status(500).json({ error: "Could not fetch the shop details" });
  }

  if (bucketConfiguration) {
    logger.info("Bucket configuration found, checking if the feed has been generated recently");

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
      logger.info("Feed has been generated previously, checking the last modification date", {
        feedLastModificationDate: feedLastModificationDate,
      });

      const secondsSinceLastModification = (Date.now() - feedLastModificationDate.getTime()) / 1000;

      if (secondsSinceLastModification < FEED_CACHE_MAX_AGE) {
        const downloadUrl = await new SignedUrls(s3Client).generateSignedGetObjectUrl({
          expiresSeconds: 30,
          fileName,
          bucket: bucketConfiguration!.bucketName,
        });

        logger.info("Feed has been generated recently, returning the last version");

        return res.redirect(downloadUrl);
      }

      logger.info("Feed is outdated, generating a new one");
    }
  }

  logger.debug("Generating a new feed");

  const cursors = await getCursors({ client, channel });

  const baseUrl = getBaseUrl(req.headers);

  // Store file names for cleanup
  const chunkFileNames: string[] = [];

  const caller = new ChunkCaller({
    maxParallelCalls: MAX_PARALLEL_CALLS,
    items: cursors,
    executeFn: (cursor) => {
      return generateDistributedChunk({
        authData,
        channelSettings,
        baseUrl,
        channel,
        cursor,
      });
    },
    processChunkResults: async (chunkResults) => {
      // Store file names for cleanup
      chunkFileNames.push(...chunkResults.map((res) => res.fileName));

      // Fetch XML content for this chunk immediately
      return Promise.all(chunkResults.map((resp) => fetchXmlChunk(resp.downloadUrl)));
    },
  });

  const xmlFileChunks = await caller.executeCalls();

  const mergedChunks = xmlFileChunks.join("\n");

  const xmlBuilder = new FeedXmlBuilder();

  const channelData = shopDetailsToProxy({
    title: shopName,
    description: shopDescription,
    storefrontUrl,
  });

  const rootXml = xmlBuilder.buildRootXml({
    channelData,
  });

  const rootXmlWithProducts = xmlBuilder.injectProductsString(rootXml, mergedChunks);

  logger.info("Bucket configuration found, uploading the feed to S3");
  const s3Client = createS3ClientFromConfiguration(channelSettings.s3BucketConfiguration);
  const fileName = getFileName({
    saleorApiUrl: authData.saleorApiUrl,
    channel,
  });

  await appRootTracer.startActiveSpan("upload to s3", async (span) => {
    span.setAttribute("bucketName", bucketConfiguration!.bucketName);
    span.setAttribute("fileName", fileName);

    try {
      await uploadFile({
        s3Client,
        bucketName: bucketConfiguration!.bucketName,
        buffer: Buffer.from(rootXmlWithProducts),
        fileName,
      });

      const downloadUrl = await new SignedUrls(s3Client).generateSignedGetObjectUrl({
        expiresSeconds: 30,
        fileName,
        bucket: bucketConfiguration!.bucketName,
      });

      logger.info("Feed uploaded to S3, redirecting the download URL");

      const fileRemover = new FileRemover(s3Client);

      await fileRemover.removeFilesBulk(chunkFileNames, bucketConfiguration!.bucketName);

      return res.redirect(downloadUrl);
    } catch (error) {
      logger.error("Could not upload the feed to S3", { error: error });
      span.setStatus({ code: SpanStatusCode.ERROR });

      return res.status(500).json({ error: "Could not upload the feed to S3" });
    } finally {
      span.end();
    }
  });
};

export default wrapWithLoggerContext(withSpanAttributes(withErrorHandler(handler)), loggerContext);

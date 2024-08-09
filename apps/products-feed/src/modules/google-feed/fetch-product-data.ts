// TODO: Refactor this file to fetcher-like class

import { url } from "inspector";
import { Client } from "urql";
import {
  FetchProductCursorsDocument,
  FetchProductDataForFeedDocument,
  GoogleFeedProductVariantFragment,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";
import { ProductProcessingLimit } from "./product-processing-limit";

const VARIANTS_PER_PAGE = 100;

export const getCursors = async ({ client, channel }: { client: Client; channel: string }) => {
  const logger = createLogger("getCursors", { saleorApiUrl: url, channel });

  logger.debug(`Fetching product cursors for channel ${channel}`);

  const processingLimit = new ProductProcessingLimit();

  let result = await client
    .query(FetchProductCursorsDocument, { channel: channel, first: VARIANTS_PER_PAGE })
    .toPromise();

  const cursors: Array<string> = [];

  processingLimit.drain();

  while (result.data?.productVariants?.pageInfo.hasNextPage) {
    const endCursor = result.data?.productVariants?.pageInfo.endCursor;

    if (endCursor) {
      cursors.push(endCursor);
      processingLimit.drain();
    }

    result = await client
      .query(FetchProductCursorsDocument, {
        channel: channel,
        first: VARIANTS_PER_PAGE,
        after: result.data.productVariants.pageInfo.endCursor,
      })
      .toPromise();
  }

  // TODO: Return cursors (stop fetching more) when the limit is exceeded
  logger.info("Processing limit status", {
    isExceeded: processingLimit.isExceeded(),
    maxPagesAllowance: processingLimit.getMaxPages(),
    takenPages: processingLimit.getProcessedPages(),
    variantsPerPage: VARIANTS_PER_PAGE,
  });

  logger.debug("Product cursors fetched successfully", {
    first: cursors[0],
    totalLength: cursors.length,
  });

  return cursors;
};

const fetchVariants = async ({
  client,
  after,
  channel,
  imageSize,
}: {
  client: Client;
  after?: string;
  channel: string;
  imageSize?: number;
}): Promise<GoogleFeedProductVariantFragment[]> => {
  const logger = createLogger("fetchVariants", { saleorApiUrl: url, channel });

  logger.debug(`Fetching variants for channel ${channel} with cursor ${after}`);

  const result = await client
    .query(FetchProductDataForFeedDocument, {
      channel: channel,
      first: VARIANTS_PER_PAGE,
      after,
      imageSize,
    })
    .toPromise();

  if (result.error) {
    logger.error(`Error during the GraphqlAPI call: ${result.error.message}`, {
      error: result.error,
    });
    return [];
  }

  const productVariants = result.data?.productVariants?.edges.map((e) => e.node) || [];

  logger.debug("Product variants fetched successfully", {
    first: productVariants[0],
    totalLength: productVariants.length,
  });

  return productVariants;
};

interface FetchProductDataArgs {
  client: Client;
  channel: string;
  cursors?: Array<string>;
  imageSize?: number;
}

export const fetchProductData = async ({
  client,
  channel,
  cursors,
  imageSize,
}: FetchProductDataArgs) => {
  const logger = createLogger("fetchProductData", {
    saleorApiUrl: url,
    channel,
    route: "Google Product Feed",
  });

  logger.debug(`Fetching product data for channel ${channel}`);

  const cachedCursors = cursors || (await getCursors({ client, channel }));

  const pageCursors = [undefined, ...cachedCursors];

  logger.debug(`Query generated ${pageCursors.length} cursors`);

  const promises = pageCursors.map((cursor) =>
    fetchVariants({ client, after: cursor, channel, imageSize }),
  );

  const results = (await Promise.all(promises)).flat();

  logger.debug("Product data fetched successfully", {
    first: results[0],
    totalLength: results.length,
  });

  return results;
};

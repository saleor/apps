import { url } from "inspector";
import { Client } from "urql";
import {
  FetchProductCursorsDocument,
  FetchProductDataForFeedDocument,
  GoogleFeedProductVariantFragment,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";

export const getCursors = async ({ client, channel }: { client: Client; channel: string }) => {
  const logger = createLogger("getCursors", { saleorApiUrl: url, channel });

  logger.debug(`Fetching product cursors for channel ${channel}`);

  let result = await client
    .query(FetchProductCursorsDocument, { channel: channel, first: 100 })
    .toPromise();

  const cursors: Array<string> = [];

  const fistCusror = result.data?.productVariants?.pageInfo.endCursor;

  if (fistCusror) {
    cursors.push(fistCusror);
  }

  while (result.data?.productVariants?.pageInfo.hasNextPage) {
    result = await client
      .query(FetchProductCursorsDocument, {
        channel: channel,
        first: 100,
        after: result.data.productVariants.pageInfo.endCursor,
      })
      .toPromise();

    const endCursor = result.data?.productVariants?.pageInfo.endCursor;

    if (endCursor) {
      cursors.push(endCursor);
    }
  }

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
      first: 100,
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

  logger.info("Product data fetched successfully", {
    first: results[0],
    totalLength: results.length,
  });

  return results;
};

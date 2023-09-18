import { url } from "inspector";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import {
  FetchProductCursorsDocument,
  FetchProductDataForFeedDocument,
  GoogleFeedProductVariantFragment,
} from "../../../generated/graphql";

export const getCursors = async ({ client, channel }: { client: Client; channel: string }) => {
  const logger = createLogger({ saleorApiUrl: url, channel, fn: "getCursors" });

  logger.debug(`Fetching cursors for channel ${channel}`);

  let result = await client
    .query(FetchProductCursorsDocument, { channel: channel, first: 100 })
    .toPromise();

  const cursors: Array<string> = [];

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
  const logger = createLogger({ saleorApiUrl: url, channel, fn: "fetchVariants" });

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
    logger.error(`Error during the GraphqlAPI call: ${result.error.message}`);
    return [];
  }

  return result.data?.productVariants?.edges.map((e) => e.node) || [];
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
  const logger = createLogger({ saleorApiUrl: url, channel, route: "Google Product Feed" });

  const cachedCursors = cursors || (await getCursors({ client, channel }));

  const pageCursors = [undefined, ...cachedCursors];

  logger.debug(`Query generated ${pageCursors.length} cursors`);

  const promises = pageCursors.map((cursor) =>
    fetchVariants({ client, after: cursor, channel, imageSize }),
  );

  const results = await Promise.all(promises);

  return results.flat();
};

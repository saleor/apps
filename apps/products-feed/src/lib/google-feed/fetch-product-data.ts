import { url } from "inspector";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import {
  FetchProductCursorsDocument,
  FetchProductDataForFeedDocument,
  GoogleFeedProductVariantFragment,
} from "../../../generated/graphql";

const getCursors = async ({ client, channel }: { client: Client; channel: string }) => {
  let result = await client
    .query(FetchProductCursorsDocument, { channel: channel as string, first: 100 })
    .toPromise();

  // First page is queried without the `after` param, so we start an array with `undefined`
  const cursors: Array<string | undefined> = [undefined];

  while (result.data?.productVariants?.pageInfo.hasNextPage) {
    result = await client
      .query(FetchProductCursorsDocument, {
        channel: channel as string,
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
}: {
  client: Client;
  after?: string;
  channel: string;
}): Promise<GoogleFeedProductVariantFragment[]> => {
  const logger = createLogger({ saleorApiUrl: url, channel, fn: "fetchVariants" });

  const result = await client
    .query(FetchProductDataForFeedDocument, {
      channel: channel as string,
      first: 100,
      after,
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
}

export const fetchProductData = async ({ client, channel }: FetchProductDataArgs) => {
  const logger = createLogger({ saleorApiUrl: url, channel, route: "Google Product Feed" });

  const cursors = await getCursors({ client, channel });

  logger.debug(`Query generated ${cursors.length} cursors`);

  const promises = cursors.map((cursor) => fetchVariants({ client, after: cursor, channel }));

  const results = await Promise.all(promises);

  return results.flat();
};

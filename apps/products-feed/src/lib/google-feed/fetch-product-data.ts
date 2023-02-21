import { url } from "inspector";
import { Client } from "urql";
import { logger as pinoLogger } from "../../lib/logger";
import {
  FetchProductDataForFeedDocument,
  GoogleFeedProductVariantFragment,
} from "../../../generated/graphql";

interface FetchProductDataArgs {
  client: Client;
  channel: string;
}

export const fetchProductData = async ({ client, channel }: FetchProductDataArgs) => {
  const logger = pinoLogger.child({ saleorApiUrl: url, channel, route: "Google Product Feed" });

  let result = await client
    .query(FetchProductDataForFeedDocument, { channel: channel as string, first: 100 })
    .toPromise();

  if (result.error) {
    logger.error(`Error during the GraphqlAPI call: ${result.error.message}`);
    throw new Error("Error during the GraphQL API call");
  }

  let variants: GoogleFeedProductVariantFragment[] =
    result.data?.productVariants?.edges.map((e) => e.node) || [];

  while (result.data?.productVariants?.pageInfo.hasNextPage) {
    logger.debug("Fetching the next page of products");

    result = await client
      .query(FetchProductDataForFeedDocument, {
        channel: channel as string,
        first: 100,
        after: result.data.productVariants.pageInfo.endCursor,
      })
      .toPromise();

    if (result.error) {
      logger.error(`Error during the GraphqlAPI call: ${result.error.message}`);
      throw new Error("Error during the GraphQL API call");
    }

    if (!result.data?.productVariants?.edges.length) {
      logger.warn("Fetching the second page of results resulted in no entries");
      break;
    }
    variants = variants?.concat(result.data?.productVariants?.edges.map((e) => e.node));
  }

  return variants;
};

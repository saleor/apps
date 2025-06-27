import { Client } from "urql";

import { ShopDetailsDocument } from "../../../generated/graphql";
import { createLogger } from "../../logger";

interface FetchShopDataArgs {
  client: Client;
  channel: string;
}

export const fetchShopData = async ({ client, channel }: FetchShopDataArgs) => {
  const logger = createLogger("fetchShopData", {
    channel,
    route: "Google Product Feed",
  });

  logger.debug("Fetching shop details");

  const result = await client.query(ShopDetailsDocument, {}).toPromise();
  const shopDetails = result.data?.shop;

  if (result.error) {
    throw new Error("Error during the GraphQL API call");
  }

  if (!shopDetails) {
    throw new Error("Shop details query returned no data");
  }

  logger.debug("Shop details fetched successfully", {
    shopDetails: {
      name: shopDetails.name,
    },
  });

  return {
    shopName: shopDetails?.name,
    shopDescription: shopDetails?.description || undefined,
  };
};

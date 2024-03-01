import { url } from "inspector";
import { Client } from "urql";
import { ShopDetailsDocument } from "../../../generated/graphql";
import { createLogger } from "../../logger";

interface FetchShopDataArgs {
  client: Client;
  channel: string;
}

export const fetchShopData = async ({ client, channel }: FetchShopDataArgs) => {
  const logger = createLogger("fetchShopData", {
    saleorApiUrl: url,
    channel,
    route: "Google Product Feed",
  });

  const result = await client.query(ShopDetailsDocument, {}).toPromise();
  const shopDetails = result.data?.shop;

  if (result.error) {
    logger.error(`Error during the GraphqlAPI call: ${result.error.message}`);
    throw new Error("Error during the GraphQL API call");
  }

  if (!shopDetails) {
    logger.error("Shop details query returned no data");
    throw new Error("Shop details query returned no data");
  }

  return {
    shopName: shopDetails?.name,
    shopDescription: shopDetails?.description || undefined,
  };
};

import { Client } from "urql";
import {
  GetAppDetailsAndWebhooksDataDocument,
  GetSaleorInstanceDataDocument,
} from "../../generated/graphql";

interface GetSaleorInstanceDetailsArgs {
  client: Client;
}

export const getSaleorInstanceDetails = async ({ client }: GetSaleorInstanceDetailsArgs) => {
  return client
    .query(GetSaleorInstanceDataDocument, {})
    .toPromise()
    .then((r) => {
      if (r.error) {
        throw new Error(
          `Getting Saleor Instance details failed. The API returned an error: ${r.error.message}`,
        );
      }

      return {
        shop: r.data?.shop,
        channels: r.data?.channels || [],
      };
    });
};

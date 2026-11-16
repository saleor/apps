import { type Client } from "urql";

import {
  FetchSaleorVersionDocument,
  type FetchSaleorVersionQuery,
} from "../../../generated/graphql";

export async function fetchSaleorVersion(client: Client): Promise<string> {
  const { error, data } = await client
    .query<FetchSaleorVersionQuery>(FetchSaleorVersionDocument, {})
    .toPromise();

  if (error || !data?.shop.version) {
    throw new Error("Can't fetch Saleor version");
  }

  return data.shop.version;
}

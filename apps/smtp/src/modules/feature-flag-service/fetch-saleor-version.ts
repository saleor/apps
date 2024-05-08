import { Client, gql } from "urql";
import { FetchSaleorVersionDocument, FetchSaleorVersionQuery } from "../../../generated/graphql";

gql`
  query FetchSaleorVersion {
    shop {
      version
    }
  }
`;

export async function fetchSaleorVersion(client: Client): Promise<string> {
  const { error, data } = await client
    .query<FetchSaleorVersionQuery>(FetchSaleorVersionDocument, {})
    .toPromise();

  if (error || !data?.shop.version) {
    throw new Error("Can't fetch Saleor version");
  }

  return data.shop.version;
}

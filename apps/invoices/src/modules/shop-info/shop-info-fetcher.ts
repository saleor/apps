import { Client, gql } from "urql";
import { ShopInfoDocument, ShopInfoFragment } from "../../../generated/graphql";

gql`
  fragment ShopInfo on Shop {
    companyAddress {
      country {
        country
        code
      }
      city
      firstName
      lastName
      streetAddress1
      streetAddress2
      companyName
      phone
      postalCode
      countryArea
      cityArea
    }
  }
  query ShopInfo {
    shop {
      ...ShopInfo
    }
  }
`;

export interface IShopInfoFetcher {
  fetchShopInfo(): Promise<ShopInfoFragment | null>;
}

export class ShopInfoFetcher implements IShopInfoFetcher {
  constructor(private client: Client) {}

  fetchShopInfo(): Promise<ShopInfoFragment | null> {
    return this.client
      .query(ShopInfoDocument, {})
      .toPromise()
      .then((resp) => resp.data?.shop ?? null);
  }
}

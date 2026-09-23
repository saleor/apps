import { TotalPriceFragment } from "@/graphql/fragments";
import { graphql } from "@/graphql/gql";

export const GetCheckoutTotalPriceQuery = graphql(
  `
    query GetCheckoutTotalPrice($checkoutId: ID!) {
      checkout(id: $checkoutId) {
        totalPrice {
          ...TotalPrice
        }
      }
    }
  `,
  [TotalPriceFragment],
);

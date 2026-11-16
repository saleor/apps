import { TotalPriceFragment } from "@/graphql/fragments";
import { graphql } from "@/graphql/gql";

export const GetCheckoutTotalPriceQuery = graphql(
  `
    query GetCheckoutTotalPrice($checkoutId: ID!) {
      checkout(id: $checkoutId) {
        authorizeStatus
        chargeStatus
        channel {
          slug
        }
        email
        billingAddress {
          firstName
          lastName
          streetAddress1
          streetAddress2
          city
          countryArea
          country {
            code
          }
          postalCode
          phone
        }
        totalPrice {
          ...TotalPrice
        }
      }
    }
  `,
  [TotalPriceFragment],
);

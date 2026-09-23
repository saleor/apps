import { graphql } from "@/graphql/gql";

export const ShippingAddressFragment = graphql(`
  fragment ShippingAddress on Address {
    firstName
    lastName
    streetAddress1
    city
    postalCode
    country {
      code
    }
    countryArea
  }
`);

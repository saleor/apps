import { graphql } from "@/graphql/gql";

export const BillingAddressFragment = graphql(`
  fragment BillingAddress on Address {
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

import { graphql } from "gql.tada";

export const UserFragment = graphql(`
  fragment User on User @_unmask {
    id
    email
    avataxCustomerCode: metafield(key: "avataxCustomerCode")
  }
`);

import { graphql } from "gql.tada";

export const UserFragment = graphql(`
  fragment User on User {
    id
    email
    avataxCustomerCode: metafield(key: "avataxCustomerCode")
  }
`);

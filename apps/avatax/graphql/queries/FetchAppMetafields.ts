import { graphql } from "@/graphql";

export const FetchAppMetafieldsQuery = graphql(`
  query FetchAppMetafields($keys: [String!]) {
    app {
      id
      privateMetafields(keys: $keys)
    }
  }
`);

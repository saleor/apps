import { graphql } from "@/graphql";

export const FetchAppDetailsQuery = graphql(`
  query FetchAppDetails {
    app {
      id
      privateMetadata {
        key
        value
      }
    }
  }
`);
